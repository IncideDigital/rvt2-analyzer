import Console from "@/lib/Console";

import { getElasticClient } from "../index.js";
import { showMessage } from "./messages.js";

/** Vuex store module to get and edit source metadata from an ElasticSearch database.
 * @module store/modules/sources
 */

const state = {
  /** Sources available in the ElasticSearch database */
  sources: [],
  /** The name of the current index */
  indiceOfSources: undefined
};

/** The mutations.
@namespace
*/
const mutations = {
  /** Mutate the state: sources.
  @param {Array} sources - An array of sources, as returned by ElasticSearch in data.hits.hits.*/
  sources(state, sources) {
    state.sources = sources;
  },

  /** Change the name of the metadata index. */
  indiceOfSources(state, indiceOfSources) {
    state.indiceOfSources = indiceOfSources;
  },

  /** Update a specific source.
   * @property {Number} idx - The index of the source in the sources array.
   * @property {Object} newData - The new metadata for the source.
   */
  updateSource(state, { idx, newData }) {
    state.sources[idx]._source = Object.assign(
      state.sources[idx]._source,
      newData
    );
  },

  /** Read initial configuration */
  config(state, config) {
    state.indiceOfSources = config.ES_SOURCES_INDICE;
  }
};

/** The actions.
@namespace
*/
const actions = {
  /** Get information about a single source.
   * @param {String} name - The name of the source. */
  async loadSourceByName({ state, rootState, commit }, name) {
    // first, clean the array
    commit("sources", []);
    let esclient = getElasticClient(
      rootState.esserver,
      state.indiceOfSources,
      commit
    );
    // get all the sources registered in the RVTINDEX database
    let query = {
      query: { term: { "name.keyword": { value: name } } },
      size: 1,
      sort: [{ started: { order: "desc" } }]
    };
    let data = await esclient.request(undefined, "search", query);
    if (data) {
      commit("sources", data.hits.hits);
    } else {
      commit("sources", []);
    }
  },

  /** Load all sources in a case sources from the server. */
  async loadSources({ commit, state, rootState }, { casename }) {
    // first, clean the array
    commit("sources", []);
    let esclient = getElasticClient(
      rootState.esserver,
      state.indiceOfSources,
      commit
    );
    // get all the sources registered in the ES_SOURCES_INDICE database
    let query = {
      sort: [{ started: { order: "desc" } }],
      size: rootState.config.MAX_NUMBER_SOURCES,
      query: { term: { "casename.keyword": { value: casename } } }
    };
    let data = await esclient.request(undefined, "search", query);
    if (data) {
      commit("sources", data.hits.hits);
    } else {
      commit("sources", []);
    }
  },

  /** Create a new source in ES.
   * @param {Number} newMetadata - An object describing the source. It needs a name,
   * which will be used as identifier, and a casename.
   */
  async newSource({ commit, state, rootState, dispatch }, { newMetadata }) {
    if (!("name" in newMetadata)) {
      showMessage(commit, "You must define a name in the metadata", "error");
      return;
    }
    let esclient = getElasticClient(
      rootState.esserver,
      state.indiceOfSources,
      commit
    );
    await esclient.request(newMetadata.name, "index", newMetadata);
    setTimeout(() => {
      dispatch("loadSources", { casename: newMetadata.casename }).resolve();
    }, rootState.config.WAIT_RELOAD_SOURCES);
  },

  /** Remove a source from the server.
   * For security reasons, this method only removes the source metadata, not the source itself.
   * You must manually delete the index.
   * @param {Number} idx - Index of the source to remove in the sources array.
   */
  async removeSource({ dispatch, state, rootState, commit }, idx) {
    let esclient = getElasticClient(
      rootState.esserver,
      state.indiceOfSources,
      commit
    );
    const source = state.sources[idx];
    await esclient.lowlevel_request(
      `${state.indiceOfSources}/${rootState.config.DOCTYPE}/${source._id}`,
      "DELETE"
    );
    setTimeout(() => {
      dispatch("loadSources", { casename: source._source.casename }).resolve();
    }, rootState.config.WAIT_RELOAD_SOURCES);
  },

  /** Edit a source metadata.
   * @param {Object} {idx, newMetadata} - Index of the source to edit in the sources array and the new Metadata to save.
   */
  async editSource({ state, rootState, commit }, { idx, newMetadata }) {
    let esclient = getElasticClient(
      rootState.esserver,
      state.indiceOfSources,
      commit
    );
    const source = state.sources[idx];
    if (source === undefined) {
      return;
    }
    let data = await esclient.request(
      source._id,
      "update",
      { doc: newMetadata },
      rootState.config.DOCTYPE
    );
    if (data) {
      commit("updateSource", { idx, newData: newMetadata });
    }
  },

  async getStats({ state, rootState, commit }, { name }) {
    let esclient = getElasticClient(
      rootState.esserver,
      state.indiceOfSources,
      commit
    );
    let response = await esclient.lowlevel_request(`${name}/_count`);
    if (response) {
      let total_number = response.count;
      let blindsearches = [{ key: "Total", count: total_number }];
      response = await esclient.lowlevel_request(
        `${name}/_search?size=0`,
        "POST",
        {
          aggs: { blindsearches: { terms: { field: "blindsearches.keyword" } } }
        }
      );
      if (response) {
        response.aggregations.blindsearches.buckets.forEach(value => {
          blindsearches.push({ key: value.key, count: value.doc_count });
        });
      }
      return blindsearches;
    } else {
      return [];
    }
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
