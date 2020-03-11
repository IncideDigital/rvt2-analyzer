import Vue from "vue";
import Config from "./config";
import App from "./App.vue";
import router from "./router";
import vuetify from "@/plugins/vuetify";

Vue.config.productionTip = false;

import { store } from "@/store";

// initial configuration
store.commit("config", Config);
store.commit("searches/config", Config);
store.commit("sources/config", Config);
store.commit("cases/config", Config);

new Vue({
  render: h => h(App),
  router,
  store,
  vuetify
}).$mount("#app");
