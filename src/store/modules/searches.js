/** Vuex store module to search a case in ElasticSearch.
 * @module store/modules/searches
 */

import Console from "@/lib/Console.js";
import { getElasticClient } from "../index.js";
import { showMessage } from "./messages.js";

/** The state.
@namespace
*/
const state = {
  /** The (paginated) results of the last query */
  results: [],
  /** The total number of results of the last query */
  resultNumber: 0,
  /** The offset of the results array */
  offset: 0,
  /** If true, a query is running */
  runningQuery: false,
  /** A reference to the last query */
  lastQueryData: undefined,
  /** The sorting to be used in the next */
  sorting: { sortBy: "_score", descending: false },
  /** The name of the indice with data about the source */
  esSourceIndice: undefined
};

/** The mutations.
@namespace
*/
const mutations = {
  esSourceIndice(state, esSourceIndice) {
    // the index has change: reset the data
    // this is equivalent to a clean(),
    // but afaik vuex doesn't like to call a mutation from another mutation
    state.results = [];
    state.resultNumber = 0;
    state.offset = 0;
    state.lastQueryData = null;
    state.runningQuery = false;
    state.esSourceIndice = undefined;
    state.sorting = { sortBy: "_score", descending: false };

    state.esSourceIndice = esSourceIndice;
  },

  results(state, results) {
    state.results = results;
  },

  resultNumber(state, resultNumber) {
    state.resultNumber = resultNumber;
  },

  offset(state, offset) {
    state.offset = offset;
  },

  lastQueryData(state, lastQueryData) {
    state.lastQueryData = lastQueryData;
  },

  runningQuery(state, runningQuery) {
    state.runningQuery = runningQuery;
    // if running query, remove results from the table
    if (runningQuery) {
      state.results = [];
    }
  },

  sorting(state, sorting) {
    state.sorting = sorting;
  },

  /** Clean the state.
  @todo This must be an action, to check whether or not a query is running */
  clean(state) {
    state.results = [];
    state.resultNumber = 0;
    state.offset = 0;
    state.lastQueryData = null;
    state.runningQuery = false;
    state.esSourceIndice = undefined;
    state.sorting = { sortBy: "_score", descending: false };
  },

  /** Update a specific result.
   * @property {Number} idx - The index of the document in the results array.
   * @property {Object} newData - The new metadata for the document.
   */
  updateResult(state, { idx, newData }) {
    state.results.splice(
      idx,
      1,
      Object.assign({}, state.results[idx], { _source: newData })
    );
  },

  /** Update only some parts of a specific result.
   * @property {Number} idx - The index of the document in the results array.
   * @property {Object} partialData - The fields to update
   */
  partialUpdateResult(state, { idx, partialData }) {
    let newData = { ...state.results[idx]._source, ...partialData };
    state.results.splice(
      idx,
      1,
      Object.assign({}, state.results[idx], { _source: newData })
    );
  },

  /** Read initial configuration */
  config() {
    // does nothing
  }
};

/** The actions.
@namespace
*/
const actions = {
  /** Query ElasticSearch.
  @param {Object} queryData - If queryData is undefined, run the last query again.
  @param {Number} newOffset - The offset of the new query
  @todo Log the query in ElasticSearch
  */
  async queryES({ commit, rootState, state }, { queryData, newOffset = 0 }) {
    let esclient = getElasticClient(
      rootState.esserver,
      state.esSourceIndice,
      commit
    );

    if (newOffset < 0 || (newOffset > 0 && newOffset > state.resultNumber)) {
      // if new offset if offlimits, exit (it is not an error, it is just a polite request)
      return;
    }

    // save query for later
    if (queryData === undefined) {
      if (!state.lastQueryData) {
        return;
      }
      queryData = state.lastQueryData;
    } else {
      commit("lastQueryData", queryData);
    }

    commit("offset", newOffset);
    commit("runningQuery", true);

    // construct the query
    var esquery = rootState.config.QUERY_TEMPLATES[queryData.queryType](
      queryData.query,
      rootState.config.RESULT_SIZE,
      state.offset,
      state.sorting.sortBy,
      state.sorting.descending
    );

    // query elastic
    let data = await esclient.request(undefined, "search", esquery);
    let resultNumber;
    if (data !== undefined) {
      if (data.hits.total.value !== undefined) {
        // elastic >= 7
        resultNumber = data.hits.total.value;
      } else {
        // elastic <= 6
        resultNumber = data.hits.total.value;
      }
      commit("resultNumber", resultNumber);

      commit("results", data.hits.hits);

      // log the query
      // notice errors are ignored
      await esclient.lowlevel_request(
        rootState.config.ES_QUERIES_INDICE + "/" + rootState.config.DOCTYPE,
        "POST",
        {
          query: queryData.query,
          "query-type": queryData.queryType,
          offset: newOffset,
          size: rootState.config.RESULT_SIZE,
          results: resultNumber,
          casename: rootState.casename,
          source: rootState.source,
          indice: state.esSourceIndice,
          timestamp: Date.now(),
          analyst: rootState.analyst
        },
        true
      );
    }
    commit("runningQuery", false);
  },

  /** Tags all results uwing the last query.
   * @param {String} queryType - The type of query
   * @param {String} query - The query
   * @param {Array} tags - The list of tags to add to the results
   */
  async tagAllResults({ state, rootState, commit }, queryData) {
    if (queryData.tags === undefined || queryData.tags.length !== 1) {
      showMessage(commit, "The list must have exactly one tag", "error");
      return;
    }

    // build the query

    let esquery = rootState.config.QUERY_TEMPLATES[queryData.queryType](
      queryData.query,
      rootState.config.RESULT_SIZE,
      state.offset,
      state.sorting.sortBy,
      state.sorting.descending
    );

    var a = {
      query: esquery["query"],
      script: {
        source:
          'if (ctx._source.containsKey("tags")) { if(!ctx._source["tags"].contains(params.new_tag)) {ctx._source.tags.add(params.new_tag);} } else {ctx._source.tags = [params.new_tag]}',
        params: { new_tag: queryData["tags"][0] }
      }
    };

    let esclient = getElasticClient(
      rootState.esserver,
      state.esSourceIndice,
      commit
    );
    let response = await esclient.lowlevel_request(
      `${state.esSourceIndice}/_update_by_query`,
      "POST",
      a
    );
    if (response) {
      showMessage(commit, `Tag "${queryData["tags"][0]}" added to the results`);
    }
  },

  /** Edit a document metadata.
  @property {Number} idx - The index of the document to save, in the results array
  @property {Object} newMetadata - The new (partial) metadata for the document
  */
  async editDocument({ state, rootState, commit }, { idx, newMetadata }) {
    let esclient = getElasticClient(
      rootState.esserver,
      state.esSourceIndice,
      commit
    );

    const document = state.results[idx];
    let data = await esclient.request(document._id, "update", {
      doc: newMetadata
    });
    if (data) {
      commit("partialUpdateResult", { idx, partialData: newMetadata });
    }
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
