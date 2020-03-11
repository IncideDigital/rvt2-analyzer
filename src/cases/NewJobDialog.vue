<!-- Manages a dialog to change the index metadata. -->

<template>
  <v-dialog v-model="visible" max-width="500px" persistent>
    <!-- Configure params -->
    <v-card>
      <v-card-title class="headline">
        <span class="headline">{{ title }}</span>
      </v-card-title>
      <v-card-text>
        <v-combobox
          v-model="jobname"
          :allow-overflow="false"
          :items="available_jobs"
          :search-input.sync="search"
          label="Job name"
          persistent-hint=""
          :filter="filter"
          @change="updateParams()"
        >
          <template v-if="noData" v-slot:no-data>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>
                  No results matching "<strong>{{ search }}</strong
                  >".
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>
          <template v-slot:selection="{ attrs, item }">
            {{ item.job }}
          </template>
          <template v-slot:item="{ index, item }">
            <strong>{{ item.job }}</strong
            >:&nbsp;
            <span class="caption text-truncate">{{ item.short }}</span>
          </template>
        </v-combobox>

        <template v-if="description">
          <span>{{ description.description }}</span>
          <template v-for="(value, name) in description.params">
            <v-text-field
              :key="name"
              v-model="description.params[name]"
              :label="name"
              :hint="description.params_help[name]"
            />
          </template>
        </template>
      </v-card-text>
      <v-card-actions>
        <v-btn color="secondary" text @click.native="close(false)"
          >Cancel</v-btn
        >
        <v-spacer />
        <v-btn color="primary" @click.native="close(true)"
          ><v-icon>mdi-run-fast</v-icon> Run job</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
const axios = require("axios");
import { data2array } from "@/lib/rvt2client.js";
import Console from "@/lib/Console.js";

/**
 * A Vue component to show a dialog to edit the fields of any dictionary.
 *
 * @module components/EditDataDialog
 * @vue-data {String} title="NO TITLE" - The title of the dialog
 * @vue-data {Array} fields - An array of objects {name, label, type, prependIcon}
 * @vue-data {Boolean} visible=false - Wether the dialog is visible
 * @vue-prop {String} [cancel="Cancel"] - The text to show on the cancel button.
 * @vue-prop {String} [save="Save"] - The Test to show on the save button
 */
export default {
  props: {
    cancel: {
      type: String,
      mandatory: false,
      default: () => "Cancel"
    },
    save: {
      type: String,
      mandatory: false,
      default: () => "Save"
    }
  },

  data() {
    return {
      title: "NO TITLE",
      fields: [],
      visible: false,
      jobname: null,
      description: null,
      available_jobs: [],
      search: null,
      noData: true
    };
  },

  methods: {
    /** Show the dialog.
     * @return A promise. You can use this promise with await.
     */
    edit({ title, fields }) {
      // show the dialog. Use as a promise or with await.
      this.title = title;
      this.fields = fields;
      this.visible = true;
      // get the available jobs from the rvt2 server
      axios
        .get(`${this.$store.state.config.RVT2SERVER}/available_jobs`)
        .then(data => (this.available_jobs = data2array(data.data)));
      return new Promise(resolve => {
        this.resolve = resolve;
      });
    },

    /** Close the dialog and resolve the promise returned by the edit() method. */
    close(ok) {
      if (ok && this.jobname) {
        const newData = {
          casename: this.fields.casename,
          source: this.fields.source,
          jobname: this.jobname.job,
          params: this.description.params
        };
        this.resolve(newData);
        this.visible = false;
      } else {
        this.resolve(null);
        this.visible = false;
      }
    },

    /** A job is selected: update the parameters to configure */
    async updateParams() {
      // get parameters from the RVT2 server
      let data = await axios.get(
        `${this.$store.state.config.RVT2SERVER}/help/${this.jobname.job}/${this.fields.casename}/${this.fields.source}`
      );
      this.description = data.data;
    },

    /** Filter available jobs in the combo box according to the user input.
     * @param {Object} item - The item to check. One element in the this.available_jobs array.
     * @param {String} queryText - The string the user introduced in the combo box.
     * @return True if item matches queryText. False otherwise.
     */
    filter(item, queryText) {
      const hasValue = val => (val != null ? val : "");
      // set query to a string, even if empty
      const query = hasValue(queryText);

      return (
        item.job
          .toString()
          .toLowerCase()
          .indexOf(query.toString().toLowerCase()) > -1
      );
    }
  }
};
</script>
