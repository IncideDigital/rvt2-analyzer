/** @module store */

import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const LOCALSTORAGE_NAMESPACE = "rvt2-analyzer";

import searches from "./modules/searches.js";
import sources from "./modules/sources.js";
import messages from "./modules/messages.js";
import { showMessage } from "./modules/messages.js";
import cases from "./modules/cases.js";
import Console from "@/lib/Console";

import { ESClient } from "@/lib/elastic";

const state = {
  /** The URL to the elasticsearch server */
  esserver: undefined,
  /** The URL to the rvt2 daemon */
  rvt2server: undefined,
  /** The name of the currelty logged analyst */
  analyst: undefined,
  /** The config object {@link config} */
  config: undefined,
  /** The selected casename. Use only as information to the user. */
  casename: undefined,
  /** The selected source. User only as information to the user. */
  source: undefined
};

/** The mutations.
@namespace
*/
const mutations = {
  /** Change a new esserver and connect to it.
   * The new server is saved in the browser cache. */
  esserver(state, esserver) {
    // save the esserver in the local filesystem
    localStorage.setItem(`${LOCALSTORAGE_NAMESPACE}.esserver`, esserver);
    state.esserver = esserver;
  },

  /** Change the rvt2 daemon and connect to it.
   * The new server is saved in the browser cache. */
  rvt2server(state, rvt2server) {
    state.rvt2server = rvt2server;
  },

  /** Change the analyst name.

  The new analyst name is saved in the browser cache. */
  analyst(state, analyst) {
    localStorage.setItem(`${LOCALSTORAGE_NAMESPACE}.analyst`, analyst);
    state.analyst = analyst;
  },

  casename(state, casename) {
    state.casename = casename;
  },

  source(state, source) {
    state.source = source;
  },

  /** Initialize the state according to the saved state and the configuration.
  Some values are read from the configuration if not saved. */
  config(state, config) {
    // Read the esserver fron the saved state or the configuration
    let esserver = localStorage.getItem(`${LOCALSTORAGE_NAMESPACE}.esserver`);
    if (!esserver) {
      state.esserver = config.ESSERVER;
    } else {
      state.esserver = esserver;
    }

    // Read the analyst name from the saved state or the configuration
    state.analyst = localStorage.getItem(`${LOCALSTORAGE_NAMESPACE}.analyst`);
    if (!state.analyst) {
      state.analyst = config.DEFAULT_ANALYST;
    }

    // Read the rvt server from the configuration
    state.rvt2server = config.RVT2SERVER;

    state.config = config;
  }
};

/** Global Vuex store.*/
export const store = new Vuex.Store({
  state,
  mutations,
  modules: {
    sources,
    searches,
    messages,
    cases
  }
});

/**
 * Return an ESClient instance with event management: errors are commited as
 * errors, debug messages are commited as debug messages.
 * @param {String} esserver - The URL to the ElasticSearch server
 * @param {String} esindex - The default index in the ElasticSearch server for queries
 * @param {Function} commit - The (optional) Vuex commit function. If present, commit errors and debug messages.
 */
export function getElasticClient(esserver, esindex, commit) {
  let esclient = new ESClient(esserver, esindex);
  if (commit !== undefined) {
    esclient.on("error", error => showMessage(commit, error, "error"));
    esclient.on("debug", debug => showMessage(commit, debug, "debug"));
  }
  return esclient;
}
