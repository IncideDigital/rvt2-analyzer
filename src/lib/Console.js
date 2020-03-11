/** A console to log messages to the console during debugging.

Use this Object instead of raw console to avoid linter warning and errors.

@module Console */

function message2string(message) {
  if (typeof message === String) {
    return message;
  } else {
    return JSON.stringify(message);
  }
}

export default {
  /** Log a message.
  @param {String} message - Message to log. If it is a string, print it. If if is an object, stringify it.
  */
  log(message) {
    if (process.env.NODE_ENV === "production") return;
    console.log(message2string(message)); // eslint-disable-line no-console
  },

  /** Log a message as an arror.
  @param {String} message - Message to log. If it is a string, print it. If if is an object, stringify it.
  */
  error(message) {
    console.error(message2string(message)); // eslint-disable-line no-console
  },

  /** Log a message as an information message.
  @param {String} message - Message to log. If it is a string, print it. If if is an object, stringify it.
  */
  info(message) {
    if (process.env.NODE_ENV === "production") return;
    console.info(message2string(message)); // eslint-disable-line no-console
  },

  /** Log a message as a warning.
  @param {String} message - Message to log. If it is a string, print it. If if is an object, stringify it.
  */
  warning(message) {
    if (process.env.NODE_ENV === "production") return;
    console.error(message2string(message)); // eslint-disable-line no-console
  }
};
