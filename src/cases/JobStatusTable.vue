<template>
  <v-data-table
    dense
    item-key="_id"
    :headers="headers"
    :items="status"
    class="elevation-1"
    hide-default-footer
    disable-pagination
    :search="search"
    :loading="runningQuery"
  >
    <template v-slot:item.pahts="{ item }">
      {{ item.paths.join(", ") }}
    </template>
    <template v-slot:item.status="{ item }">
      <base-tag
        :tag="item.status"
        :danger-tags="['error']"
        :warning-tags="['interrupted']"
        :success-tags="['end']"
      />
    </template>
    <template v-slot:item.output="{ item }">
      <template v-if="item.status !== 'start'">
        <!-- show only if the job ended -->
        <v-btn icon :disabled="!item.logfile" @click="showLogfile(item.logfile)"
          ><v-icon>mdi-math-log</v-icon></v-btn
        >
        <v-btn icon :disabled="!item.outfile" @click="showOutfile(item.outfile)"
          ><v-icon>mdi-file-document</v-icon></v-btn
        >
      </template>
    </template>
  </v-data-table>
</template>

<script>
import BaseTag from "@/components/BaseTag.vue";
import { data2array } from "@/lib/rvt2client.js";
const axios = require("axios");

/**
 * Show an table of the status of jobs in a case. This interface allows listing jobs and its status.
 *
 * The URL to the RVT2 server can be set in the configuration.
 *
 * @module management/TheJobs
 * @vue-prop {String} casename - The name of the case to analyze. Entered by the user.
 * @vue-prop {String} search - Filter jobs using this string.
 * @vue-data {Object} status - The list of jobs run on the casename, as returned by the RVT2 server.
 */
export default {
  components: {
    BaseTag
  },

  props: {
    casename: {
      mandatory: true,
      default: () => "",
      type: String
    },
    search: {
      mandatory: false,
      default: () => "",
      type: String
    }
  },

  data() {
    return {
      status: [],
      headers: [
        { text: "Source", value: "source", sortable: true },
        { text: "Job", value: "job", sortable: true },
        { text: "Paths", value: "paths", sortable: false },
        { text: "Date", value: "date", sortable: true, filterable: false },
        { text: "Status", value: "status", sortable: true, filterable: false },
        {
          text: "Ellapsed",
          value: "ellapsed",
          sortable: true,
          filterable: false
        },
        { text: "Output", value: "output", sortable: false, filterable: false }
      ],
      runningQuery: false
    };
  },

  methods: {
    /** Update this.status, requesting a new list to the server */
    async updateJobStatus() {
      this.runningQuery = true;
      let data = await axios.get(
        `${this.$store.state.config.RVT2SERVER}/status/${this.casename}`
      );
      this.status = data2array(data.data);
      this.runningQuery = false;
    },

    /** Shows the logfile of a job.
     * @param {String} logfile - path to the logfile relative to casedir. If null or empty, it does nothing.
     */
    showLogfile(logfile) {
      if (!logfile) {
        return;
      }
      // use the URL to the server with the files in config.RVTFILES
      window.open(
        `${this.$store.state.config.RVT2FILES}/${this.casename}/${logfile}`
      );
    },

    /** Shows the logfile of a job
     * @param {String} outfile - path to the outfile relative to casedir. If null or empty, it does nothing.
     */
    showOutfile(outfile) {
      if (!outfile) {
        return;
      }
      // use the URL to the server with the files in config.RVTFILES
      window.open(
        `${this.$store.state.config.RVT2FILES}/${this.casename}/${outfile}`
      );
    }
  }
};
</script>
