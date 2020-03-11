<template>
  <v-content fluid>
    <sources-card :casename="casename" />
    <job-status-card :casename="casename" />
  </v-content>
</template>

<script>
/** @module sources/TheSources */

import SourcesCard from "./SourcesCard.vue";
import JobStatusCard from "./JobStatusCard.vue";
import Console from "@/lib/Console";

/** Show a simplified table with the available sources for the selected case (in props).
 *
 * @vue-props { casename } - The name of the selected case. If will be stored in vuex.
 */
export default {
  components: {
    SourcesCard,
    JobStatusCard
  },

  props: {
    casename: {
      mandatory: true,
      type: String,
      default: () => ""
    }
  }
};
</script>

<style></style>
