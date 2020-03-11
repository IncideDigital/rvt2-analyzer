/** @module config */

import queryStringHighLightTemplate from "./lib/query_templates/query_string_highlight";
import simpleQueryTemplate from "./lib/query_templates/simple_query";
import matchTemplate from "./lib/query_templates/match";

/////////////////////////////////////////////////////////// default indexes and their locations

// If the specific system needs a different default values, set them in public/local.js, in the window namespace

/** System configuration file.
 *
 * Most system configuration is made in this file. The exceptions are:
 *
 * - Configuration read from package.js, such as app version. Read these options from vueconfig.js.
 * See https://cli.vuejs.org/guide/mode-and-env.html#using-env-variables-in-client-side-code
 * - Authentication tokens (if any). Set this values in .env files.
 * See https://cli.vuejs.org/guide/mode-and-env.html#environment-variables
 * - Configuration values only valid for a single server can be set in public/local.js, in the window namespace.
 *   CUrrently, you can configure window.ESSERVER, window.RVT2FILES and window.RVT2SERVER.
 */
export default {
  /** Location of the default RVT2 server. The is the default value and can be configured by the user */
  RVT2SERVER:
    window.RVT2SERVER === undefined
      ? "http://localhost:5000"
      : window.RVT2SERVER,
  RVT2FILES:
    window.RVT2FILES === undefined
      ? "http://localhost:5000/morgue"
      : window.RVT2FILES,
  /** Location of the default ES server. The is the default value and can be configured by the user */
  ES_SERVER:
    window.ESSERVER === undefined ? "http://localhost:9200" : window.ESSERVER,
  /** Name of the indice for source metadata */
  ES_SOURCES_INDICE: "rvtindexer",
  /** Name of the indice for case metadata */
  ES_CASES_INDICE: "rvtcases",
  /** Name of the index to log queries */
  ES_QUERIES_INDICE: "rvtindexer-queries",
  /** Default result page size */
  RESULT_SIZE: 50,
  /** Query templates */
  QUERY_TEMPLATES: {
    query_string: queryStringHighLightTemplate,
    simple_query: simpleQueryTemplate,
    match: matchTemplate
  },
  /** If true, debug queries sent to elasticsearch */
  ESDEBUG: true,
  /** List of important labels */
  IMPORTANT_LABELS: ["important", "relevant"],
  /** List of things-to-check labels */
  CHECK_LABELS: ["check", "warning"],
  /** list of already-seen labels */
  SEEN_LABELS: ["seen", "unimportant"],
  /** The name of the default analyst, or null */
  DEFAULT_ANALYST: null,
  /** The max number of sources in ElasticSearch */
  MAX_NUMBER_SOURCES: 100,
  /** The max number of cases in ElasticSearch */
  MAX_NUMBER_CASES: 100,
  /** The doctype in elastic.
   * Do not change this parameter! This will be deprecated in future versions of elastic. */
  DOCTYPE: "_doc",
  /** Wait this number of milliseconds before reloading the source list after a change */
  WAIT_RELOAD_SOURCES: 2000,
  /** Wait this number of milliseconds before reloading the case list after a change */
  WAIT_RELOAD_CASES: 2000
};
