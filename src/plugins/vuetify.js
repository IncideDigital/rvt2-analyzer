import "@mdi/font/css/materialdesignicons.css"; // Ensure you are using css-loader
import Vue from "vue";
import Vuetify from "vuetify/lib";

/** Configure the style of the vuetify components */

Vue.use(Vuetify);

export default new Vuetify({
  icons: {
    iconfont: "mdi" // default - only for display purposes
  },
  theme: {
    themes: {
      // Black and orange
      //light: { primary: "#344955", secondary: "#f9aa33", accent: "#FF7043", error: "#f44336", warning: "#FBC02D", info: "#2196f3", success: "#4caf50" }
      // Black and green
      //light: { primary: "#565656", secondary: "#00897b", accent: "#FBC02D", error: "#f44336", warning: "#FBC02D", info: "#2196f3", success: "#4caf50" }
      // INCIDE's theme: corporative blue
      light: {
        primary: "#0288D1",
        secondary: "#555555",
        accent: "#025F92",
        error: "#f44336",
        warning: "#D18802",
        info: "#2196f3",
        success: "#4caf50"
      }
    }
  }
});
