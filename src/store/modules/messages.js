import Console from "@/lib/Console";

/** Vuex store module to manage system messages.
 * @module store/modules/messages
 */

const state = {
  /** The stack of messages */
  messages: {
    error: [],
    info: [],
    debug: [],
    warning: []
  }
};

/** The mutations.
@namespace
*/
const mutations = {
  /** Cleans all messages */
  clean(state) {
    state.messages = {
      error: [],
      info: [],
      debug: [],
      warning: []
    };
  },

  /** Register a new message in the stack.
   * @param {String} type - The type of message: error, info, debug or warning
   * @param {String} message - The message to show
   */
  message(state, { type, message }) {
    state.messages[type].push(message);
  },

  /** Remove the last message from the queue.
   * @param {String} type - The type of message:  error, info, debug or warning
   */
  popMessage(state, { type }) {
    state.messages[type].pop();
  }
};

/** The getters.
@namespace
*/
const getters = {
  /** @return True if there are messages in the stack. */
  hasMessages(state) {
    return (
      state.messages.error.length +
        state.messages.warning.length +
        state.messages.info.length +
        state.messages.debug.length >
      0
    );
  },

  /** @return The last message from the stack.
   * @param {String} type - The type of message:  error, info, debug or warning
   */
  lastMessage: state => type => {
    if (state.messages[type].length === 0) {
      return null;
    }
    return state.messages[type][state.messages[type].length - 1];
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  getters
};

/** A convenient function to commit a message */
export function showMessage(commit, message, type = "info") {
  commit("messages/message", { type: type, message: message }, { root: true });
}
