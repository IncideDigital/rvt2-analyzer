<template>
  <v-card>
    <v-card-title> Available Source in {{ casename }} </v-card-title>
    <source-table
      :sources="sources"
      complete
      @edit-source="editSource"
      @delete-source="deleteSource"
      @run-job-source="runJobOnSource"
    />

    <v-card-actions>
      <v-btn color="primary" @click="addSource">New source</v-btn>
    </v-card-actions>

    <edit-data-dialog ref="editDataDialog" />
    <confirm-dialog ref="confirmDialog" />
    <new-job-dialog ref="newJobDialog" />
  </v-card>
</template>

<script>
/** @module sources/TheSources */

import SourceTable from "./SourceTable.vue";
import EditDataDialog from "@/components/EditDataDialog.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import NewJobDialog from "./NewJobDialog.vue";
import Console from "@/lib/Console";
import { showMessage } from "@/store/modules/messages.js";

import { mapState } from "vuex";

/** Show a simplified table with the available sources for the selected case (in props).
 *
 * @vue-props { casename } - The name of the selected case. If will be stored in vuex.
 */
export default {
  components: {
    EditDataDialog,
    SourceTable,
    ConfirmDialog,
    NewJobDialog
  },

  props: {
    casename: {
      mandatory: true,
      type: String,
      default: () => ""
    }
  },

  /** Computed properties from vuex state:
   *
   * - esserver: {@link store}
   * - casenames: {@link store/modules/sources}
   * - cases: {@link store/modules/sources}
   */
  computed: {
    ...mapState(["esserver"]),
    ...mapState("sources", ["sources"])
  },

  mounted() {
    if (!this.casename) {
      showMessage(this.$store.commit, "Casename not provided", "error");
      return;
    }
    this.$store.commit("casename", this.casename, { root: true });
    this.$store.dispatch("sources/loadSources", { casename: this.casename });
  },

  methods: {
    async addSource() {
      // opens a dialog to ask information about the case
      let newMetadata = await this.$refs.editDataDialog.edit({
        title: `New source metadata:`,
        fields: [
          {
            name: "name",
            value: "NEWSOURCE",
            type: "textfield"
          },
          { name: "casename", value: this.casename, type: "hiden" },
          {
            name: "description",
            value: "",
            type: "textfield"
          },
          {
            name: "server",
            value: this.$store.state.config.RVT2FILES,
            type: "textfield"
          }
        ]
      });
      if (newMetadata) {
        if (!newMetadata.name) {
          showMessage(
            this.$store.commit,
            "Source name cannot be empty",
            "error"
          );
          return;
        }
        // save in elastic search
        this.$store.dispatch("sources/newSource", {
          newMetadata: newMetadata
        });
        showMessage(
          this.$store.commit,
          `New source created: ${newMetadata.name}`
        );
      }
    },

    /** Show a dialog to edit a source.

    @param {Number} selectedSource - The index of the source to edit in the $store.state.sources.sources array.
    */
    async editSource(selectedSource) {
      // opens a dialog to modify the source selectedSource
      let source = this.sources[selectedSource];
      let newMetadata = await this.$refs.editDataDialog.edit({
        title: `Edit source metadata: ${source._source.source}`,
        fields: [
          {
            name: "casename",
            value: source._source.casename,
            type: "textfield"
          },
          { name: "source", value: source._source.source, type: "hiden" },
          {
            name: "description",
            value: source._source.description,
            type: "textfield"
          },
          { name: "server", value: source._source.server, type: "textfield" }
        ]
      });
      if (newMetadata) {
        // save in elastic search
        this.$store.dispatch("sources/editSource", {
          idx: selectedSource,
          newMetadata: newMetadata
        });
        showMessage(
          this.$store.commit,
          `Metadata saved: ${source._source.source}`
        );
      }
    },

    /** Removes a source.

    Note this method only removes a source metadata, not the source itself.
    Use with care, only administrators should be able to use this option.

    @param {Number} index - The index of the source to edit in the $store.state.sources.sources array.
    */
    async deleteSource(index) {
      const sourcename = this.sources[index]._source.name;
      // ask for confirmation
      if (
        await this.$refs.confirmDialog.confirm({
          title: `Remove source "${sourcename}"`,
          message:
            "This only removes the metadata. The index itself is not removed from ElasticSeach and is still accessible."
        })
      ) {
        let response = this.$store.dispatch("sources/removeSource", index);
        if (response) {
          showMessage(
            this.$store.commit,
            `The metadata for the source "${sourcename}" was removed`
          );
        }
      }
    },

    /** Request the RVT2 server to run a job, according to the configuration entered by the user */
    async runJobOnSource(source) {
      const newJobMetadata = await this.$refs.newJobDialog.edit({
        title: `Run job on source "${source}"`,
        fields: { source: source, casename: this.casename }
      });
      Console.log(newJobMetadata);
    }
  }
};
</script>

<style></style>
