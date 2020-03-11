import Vue from "vue";
import Router from "vue-router";
import TheSources from "@/cases/TheSources.vue";
import TheSearch from "@/sources/TheSearch.vue";
import TheAnalyst from "@/analyst/TheAnalyst.vue";
import TheMorgue from "@/sources/TheMorgue.vue";
import TheCases from "@/cases/TheCases.vue";
import NotFound from "@/components/NotFound.vue";

Vue.use(Router);

export default new Router({
  routes: [
    { path: "/", component: TheAnalyst, name: "home" },
    { path: "/cases", component: TheCases, name: "cases" },
    {
      path: "/cases/:casename",
      component: TheSources,
      name: "caseinfo",
      props: true
    },
    {
      path: "/cases/:casename/index/:source",
      component: TheSearch,
      name: "search",
      props: true
    },
    {
      path: "/cases/:casename/morgue/:source",
      component: TheMorgue,
      name: "morgue",
      props: true
    },
    { path: "*", component: NotFound }
  ]
});
