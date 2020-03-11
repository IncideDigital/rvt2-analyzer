<template>
  <v-card>
    <v-card-title>
      Available Cases
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
    </v-card-title>
    <case-table
      :cases="cases"
      :search="search"
      @edit-case="editCase"
      @delete-case="deleteCase"
    />

    <v-card-actions>
      <v-btn color="primary" @click="addCase">New case</v-btn>
    </v-card-actions>

    <edit-data-dialog ref="editDataDialog" />
    <confirm-dialog ref="confirmDialog" />
  </v-card>
</template>

<script>
import Console from "@/lib/Console.js";
import { mapState } from "vuex";
import EditDataDialog from "@/components/EditDataDialog.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import CaseTable from "./CaseTable.vue";
import { showMessage } from "@/store/modules/messages.js";

import config from "@/config.js";

export default {
  components: {
    EditDataDialog,
    CaseTable,
    ConfirmDialog
  },

  data: () => {
    return {
      headers: [{ text: "Name", sortable: false, value: "casename" }],
      search: ""
    };
  },

  computed: { ...mapState("cases", ["cases"]) },

  mounted() {
    this.$store.commit("casename", null);
    this.$store.commit("source", null);
    this.$store.dispatch("cases/loadCases");
  },

  methods: {
    onClickCase(casename) {
      this.$store.commit("casename", casename);
      this.$store.commit("source", "mysource");
      this.$router.push("morgue");
      showMessage(this.$store.commit, `Connected to ${this.esserver}`);
    },

    async addCase() {
      // opens a dialog to ask information about the case
      let newMetadata = await this.$refs.editDataDialog.edit({
        title: `New case metadata:`,
        fields: [
          {
            name: "name",
            value: "NEWCASE",
            type: "textfield"
          },
          {
            name: "description",
            value: "",
            type: "textfield"
          },
          {
            name: "server",
            value: config.RVT2FILES,
            type: "textfield"
          }
        ]
      });
      if (newMetadata) {
        if (!newMetadata.name) {
          showMessage(this.$store.commit, "Casename cannot be empty", "error");
          return;
        }
        // save in elastic search
        this.$store.dispatch("cases/newCase", {
          newMetadata: newMetadata
        });
        showMessage(
          this.$store.commit,
          `New case created: ${newMetadata.name}`
        );
      }
    },

    /** Show a dialog to edit a source.

    @param {Number} selectedSource - The index of the source to edit in the $store.state.sources.sources array.
    */
    async editCase(selectedCase) {
      // opens a dialog to modify the source selectedSource
      let caseinfo = this.cases[selectedCase];
      let newMetadata = await this.$refs.editDataDialog.edit({
        title: `Edit case metadata: ${caseinfo._source.name}`,
        fields: [
          {
            name: "description",
            value: caseinfo._source.description,
            type: "textfield"
          }
        ]
      });
      if (newMetadata) {
        // save in elastic search
        this.$store.dispatch("cases/editCase", {
          idx: selectedCase,
          newMetadata: newMetadata
        });
        showMessage(
          this.$store.commit,
          `Metadata saved for case: ${caseinfo._source.name}`
        );
      }
    },

    /** Removes a case.

    @param {Number} index - The index of the case to edit in the $store.cases.cases array.
    */
    async deleteCase(index) {
      const casename = this.cases[index]._source.name;
      // ask for confirmation
      if (
        await this.$refs.confirmDialog.confirm({
          title: `Remove case: "${casename}"`,
          message:
            "Sources and files are not removed. You can create again the case with the same name."
        })
      ) {
        let response = this.$store.dispatch("cases/removeCase", index);
        if (response) {
          showMessage(
            this.$store.commit,
            `The metadata for the case "${casename}" was removed`
          );
        }
      }
    }
  }
};
</script>
