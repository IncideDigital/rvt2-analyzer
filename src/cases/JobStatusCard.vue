<template>
  <v-card>
    <v-card-title>
      Jobs run on this {{ casename }}
      <v-spacer></v-spacer>
      <v-btn small color="primary" @click="updateJobStatus">Update</v-btn>
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
    </v-card-title>

    <job-status-table ref="statusTable" :casename="casename" :search="search" />
  </v-card>
</template>

<script>
import Console from "@/lib/Console.js";
import JobStatusTable from "./JobStatusTable.vue";

/**
 * Show an admin view of the status of jobs in a case. This interface allows listing jobs, its status, and creating a new job.
 *
 * The URL to the RVT2 server can be set in the configuration.
 *
 * @module management/TheJobs
 * @vue-prop {String} casename - The name of the case to analyze. Entered by the user.
 */
export default {
  components: {
    JobStatusTable
  },

  props: {
    casename: {
      mandatory: true,
      default: () => "",
      type: String
    }
  },

  data() {
    return {
      search: ""
    };
  },

  methods: {
    updateJobStatus() {
      this.$refs.statusTable.updateJobStatus();
    }
  }
};
</script>
