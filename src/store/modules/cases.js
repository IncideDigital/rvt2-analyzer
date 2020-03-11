import Console from "@/lib/Console";

import { getElasticClient } from "../index.js";

/** Vuex store module to get and edit source case from an ElasticSearch database and the RVT2 daemon
 * @module store/modules/cases
 */

const state = {
  /** Sources available in the ElasticSearch database */
  cases: [],
  /** Name of the indice with case metadata in ES */
  indiceOfCases: ""
};

/** The mutations.
@namespace
*/
const mutations = {
  /** Mutate the state: sources.
  @param {Array} sources - An array of sources, as returned by ElasticSearch in data.hits.hits.*/
  cases(state, cases) {
    state.cases = cases;
  },

  /** Read initial configuration */
  config(state, config) {
    state.indiceOfCases = config.ES_CASES_INDICE;
  },

  /** Update a specific source.
   * @property {Number} idx - The index of the source in the sources array.
   * @property {Object} newData - The new metadata for the source.
   */
  updateCase(state, { idx, newData }) {
    state.cases[idx]._source = Object.assign(state.cases[idx]._source, newData);
  }
};

/** The actions.
@namespace
*/
const actions = {
  /** Get available cases from the RVT2 daemon.
  async loadCasesFromDaemon({ commit, rootState }) {
    let data = await axios.get(`${rootState.rvt2server}/available_cases`);
    commit("appendCases", data2array(data.data));
  }, */

  /** Load available sources from the server. */
  async loadCases({ commit, state, rootState }) {
    // first, clean the array
    commit("cases", []);
    let esclient = getElasticClient(
      rootState.esserver,
      state.indiceOfCases,
      commit
    );
    // get all the cases registered in the RVTCASES database
    let query = {
      size: rootState.config.MAX_NUMBER_CASES,
      query: { match_all: {} }
    };
    let data = await esclient.request(undefined, "search", query);
    if (data) {
      commit("cases", data.hits.hits);
    } else {
      commit("cases", []);
    }
  },

  async newCase({ commit, state, rootState, dispatch }, { newMetadata }) {
    let esclient = getElasticClient(
      rootState.esserver,
      state.indiceOfCases,
      commit
    );
    await esclient.request(newMetadata.name, "index", newMetadata);
    setTimeout(() => {
      dispatch("loadCases");
    }, rootState.config.WAIT_RELOAD_CASES);
  },

  /** Remove a case from the server.
   * This method only removes the case metadata, not the sources or files.
   * @param {Number} idx - Index of the case to remove in the cases array.
   */
  async removeCase({ dispatch, state, rootState, commit }, idx) {
    let esclient = getElasticClient(
      rootState.esserver,
      state.indiceOfCases,
      commit
    );
    const caseinfo = state.cases[idx];
    await esclient.lowlevel_request(
      `${state.indiceOfCases}/${rootState.config.DOCTYPE}/${caseinfo._id}`,
      "DELETE"
    );
    setTimeout(() => {
      dispatch("loadCases");
    }, rootState.config.WAIT_RELOAD_CASES);
  },

  /** Edit a case metadata.
   * @param {Object} {idx, newMetadata} - Index of the case to edit in the cases array and the new Metadata to save.
   */
  async editCase({ state, rootState, commit }, { idx, newMetadata }) {
    let esclient = getElasticClient(
      rootState.esserver,
      state.indiceOfCases,
      commit
    );
    const caseinfo = state.cases[idx];
    if (caseinfo === undefined) {
      return;
    }
    let data = await esclient.request(
      caseinfo._id,
      "update",
      { doc: newMetadata },
      rootState.config.DOCTYPE
    );
    if (data) {
      commit("updateCase", { idx, newData: newMetadata });
    }
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
