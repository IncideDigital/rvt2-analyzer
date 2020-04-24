<template>
  <v-container fluid>
    <source-table
      :sources="sourceMetadata"
      :show-headers="true"
      disable-run
      disable-delete
      @edit-source="editSource($event)"
    />
    <small>ESServer: {{ esserver }}</small>

    <query-form
      :available-query-types="availableQueryTypes"
      @query="queryES"
      @query-and-tag="queryAndTag"
    ></query-form>

    <v-spacer />

    <div class="elevation-3">
      <v-tabs v-model="currentTabName" icons-and-text centered>
        <v-tab v-for="tab in tabs" :key="tab.name" :href="'#tabs-' + tab.name">
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <span v-on="on">
                {{ tab.name }}
              </span>
            </template>
            <span v-if="tab.title">{{ tab.title }}</span>
            <span v-else>Change to this tab</span>
          </v-tooltip>
          <v-icon>{{ tab.icon }}</v-icon>
        </v-tab>
        <v-tab key="config" href="#tabs-config">
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <span v-on="on">
                Custom
              </span>
            </template>
            <span>Configure fields in the table</span>
          </v-tooltip>
          <v-icon>mdi-settings</v-icon>
        </v-tab>
      </v-tabs>
      <v-tabs-items v-model="currentTabName">
        <v-tab-item
          v-for="tab in tabs"
          :key="tab.name"
          :value="'tabs-' + tab.name"
        >
          <v-card flat>
            <v-card-text>
              <!-- navigation bar at the begining -->
              <v-row justify="center">
                <v-col class="text-center">
                  <template
                    v-if="resultNumber > $store.state.config.RESULT_SIZE"
                  >
                    <v-btn
                      text
                      @click="
                        queryES(
                          undefined,
                          offset - $store.state.config.RESULT_SIZE
                        )
                      "
                    >
                      <v-icon>mdi-arrow-left</v-icon> Previous
                    </v-btn>
                    Total: {{ resultNumber }}. Showing {{ offset + 1 }} -
                    {{
                      Math.min(
                        offset + $store.state.config.RESULT_SIZE,
                        resultNumber
                      )
                    }}
                    <v-btn
                      text
                      @click="
                        queryES(
                          undefined,
                          offset + $store.state.config.RESULT_SIZE
                        )
                      "
                    >
                      Next <v-icon>mdi-arrow-right</v-icon>
                    </v-btn> </template
                  ><template v-else> Total: {{ resultNumber }}. </template>
                </v-col>
              </v-row>
              <!-- table -->
              <component
                :is="tab.component"
                :results="results"
                :source-server="
                  sourceMetadata.length
                    ? sourceMetadata[0]._source.server
                    : 'http://localhost'
                "
                :extra-headers="tab.extraHeaders"
                :analysis="tab.analysis"
                :score="tab.score"
                :filename="tab.filename"
                :sorting="sorting"
                @request-edit-column="editColumn"
                @save-column="saveColumn"
                @sort-results="sortResults"
                @show-document="showDocument"
              />

              <!-- Navigation bar at the bottom -->
              <v-row justify="center">
                <v-col class="text-center">
                  <template
                    v-if="resultNumber > $store.state.config.RESULT_SIZE"
                  >
                    <v-btn
                      text
                      @click="
                        queryES(
                          undefined,
                          offset - $store.state.config.RESULT_SIZE
                        )
                      "
                    >
                      <v-icon>mdi-arrow-left</v-icon> Previous
                    </v-btn>
                    Total: {{ resultNumber }}. Showing {{ offset + 1 }} -
                    {{
                      Math.min(
                        offset + $store.state.config.RESULT_SIZE,
                        resultNumber
                      )
                    }}
                    <v-btn
                      text
                      @click="
                        queryES(
                          undefined,
                          offset + $store.state.config.RESULT_SIZE
                        )
                      "
                    >
                      Next <v-icon>mdi-arrow-right</v-icon>
                    </v-btn> </template
                  ><template v-else> Total: {{ resultNumber }}. </template>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-tab-item>
        <v-tab-item value="tabs-config">
          <v-card flat>
            <v-card-text>
              <edit-tab-dialog :tabs="tabs" @save-tab="saveTab" />
            </v-card-text>
          </v-card>
        </v-tab-item>
      </v-tabs-items>
    </div>

    <edit-data-dialog ref="editDataDialog" />
    <document-dialog ref="documentDialog" />
  </v-container>
</template>

<script>
import QueryForm from "./QueryForm.vue";
import SourceTable from "@/cases/SourceTable.vue";
import EditDataDialog from "@/components/EditDataDialog.vue";
import FileViewTable from "./FileViewTable.vue";
import EditTabDialog from "./EditTabDialog.vue";
import DocumentDialog from "./DocumentDialog.vue";
import { mapState } from "vuex";
import { showMessage } from "@/store/modules/messages.js";

import Console from "@/lib/Console.js";

// registered table views. Default value
var savedTabs = [
  {
    name: "FILES",
    title: "Show results as files",
    icon: "mdi-folder-open",
    score: true,
    columns: "",
    analysis: true,
    filename: true
  },
  {
    name: "EMAILS",
    title: "Show results as emails",
    icon: "mdi-email",
    columns: "email_subject,email_sent,email_from,email_to",
    score: false,
    analysis: true,
    filename: false
  }
];

/**
 * A Vue component to search a source and show the results.
 *
 * Computed properties from vuex state:
 *
 * - results: {@link store/modules/searches}
 * - resultNumber: {@link store/modules/searches}
 * - runningQuery: {@link store/modules/searches}
 * - offset: {@link store/modules/searches}
 * - sorting: {@link store/modules/searches}
 *
 * @module search/TheSearch
 * @vue-prop {String} source - The name of the source to load.
 * @vue-data {Array} sourceMetadata - Metadata of the currently loaded source. It is an array of one element
 * @vue-data {String} queryType - Key in $store.state.config.QUERY_TEMPLATES of the current query
 * @vue-data {String} query - Current query
 * @vue-data {Array} tabs - Information about the available tabs
 * @vue-data {String} currentTabName - The name of the currently selected tab
 */
export default {
  components: {
    QueryForm,
    SourceTable,
    EditDataDialog,
    EditTabDialog,
    DocumentDialog
  },

  props: {
    source: {
      type: String,
      mandatory: true,
      default() {
        return "";
      }
    },
    casename: {
      type: String,
      mandatory: true,
      default() {
        return "";
      }
    }
  },

  data: function() {
    return {
      sourceMetadata: [],
      queryType: null,
      query: null,
      tabs: savedTabs,
      currentTabName: "tabs-FILES"
    };
  },

  computed: {
    availableQueryTypes: function() {
      // list of keys in this.$store.state.config.QUERY_TEMPLATES
      return Object.keys(this.$store.state.config.QUERY_TEMPLATES);
    },
    ...mapState(["esserver", "esclient"]),
    ...mapState("sources", ["sources"]),
    ...mapState("searches", [
      "resultNumber",
      "results",
      "runningQuery",
      "offset",
      "sorting"
    ])
  },

  watch: {
    sources(value) {
      if (value === undefined || value.length === 0) {
        return;
      }
      this.sourceMetadata = value;
      this.tabs = [];
      // load tabs
      if (this.sourceMetadata[0]._source.tabs !== undefined) {
        // if the database provides the configuration of the tabs, load it
        savedTabs = this.sourceMetadata[0]._source.tabs;
      }
      for (let i = 0; i < savedTabs.length; i++) {
        let newTab = savedTabs[i];
        newTab.component = FileViewTable;
        if (newTab.columns) {
          newTab.extraHeaders = newTab.columns.split(",").map(x => {
            return this.parseFieldName(x.trim());
          });
        } else {
          newTab.extraHeaders = [];
        }
        this.tabs.push(newTab);
      }
      // load first tab
      this.currentTabName = "tabs-" + this.tabs[0].name;
    }
  },

  mounted() {
    if (!this.casename || !this.source) {
      showMessage(this.$store.commit, "Casename or source is null", "error");
      return;
    }
    this.$store.commit("casename", this.casename);
    this.$store.commit("source", this.source);
    this.$store.commit("searches/esSourceIndice", this.source);
    this.$store.dispatch("sources/loadSourceByName", this.source);
  },

  methods: {
    /** Change the sorting parameters and query again ElasticSearch */
    sortResults: function(sorting) {
      this.$store.commit("searches/sorting", sorting);
      this.queryES();
    },

    /** Dispatches 'searches/queryES' */
    queryES(queryData, newOffset = 0) {
      this.$store.dispatch("searches/queryES", { queryData, newOffset });
    },

    /** Dispatches 'searches/tagAllResults' */
    queryAndTag(queryData) {
      this.$store.dispatch("searches/tagAllResults", queryData);
    },

    async showDocument(document) {
      await this.$refs.documentDialog.show(document);
    },

    /** Opens a dialog to modify a column.
     * If the user presses 'OK', the column in saved in ElasticSearch.
     * @param {Number} idx - The index of the document, in the results array
     * @param {String} name - The name of the column. If undefined, show a dialog to create a new column.
     */
    async editColumn({ idx, name }) {
      const document = this.results[idx];

      const params = {};
      let new_column = false;
      if (name !== undefined) {
        params.title = `Edit ${name}`;
        params.fields = [
          { name: name, value: document._source[name], type: "textarea" }
        ];
      } else {
        params.title = "Add or edit column";
        params.fields = [
          {
            label: "Column name",
            name: "column_name",
            value: "column_name",
            type: "textfield"
          },
          { name: "value", value: "", type: "textarea" }
        ];
        new_column = true;
      }

      let newMetadata = await this.$refs.editDataDialog.edit(params);
      if (newMetadata) {
        let column_name = null;
        let column_value = null;
        if (new_column) {
          column_name = newMetadata.column_name;
          column_value = newMetadata.value;
        } else {
          column_name = name;
          column_value = newMetadata[name];
        }
        // save in elastic search
        this.saveColumn({ idx: idx, name: column_name, value: column_value });
      }
    },

    /** Save the value of a column.
     * Using this method also saves the name of the current analyst in the metadata of the document.
     * After saving a column, forceUpdate() the page.
     * @property {Number} idx - The index of the document in the results array.
     * @property {String} name - The name of the field to save.
     * @property {String} value - The value of the file to save.
     */
    async saveColumn({ idx, name, value }) {
      const newMetadata = {};
      newMetadata[name] = value;
      newMetadata.analyst = this.$store.state.analyst;
      await this.$store.dispatch("searches/editDocument", { idx, newMetadata });
      this.$forceUpdate();
    },

    /** Edit tab.
     * @param {Object} newMetadata - {name, icon, score, title, filename(bool), analysis(bool), columns}.
     *    _columns_ is a string, where fields to be shown are comma separated. */
    saveTab(newMetadata) {
      if (newMetadata.tabIndex === -1) {
        // if tabIndex === -1, it is a new tab
        if (newMetadata.delete || newMetadata.name === "") {
          // you cannot delete new tabs, nor create tabs with an empty name
          return;
        }
        this.tabs.push({
          name: newMetadata.name,
          icon: newMetadata.icon,
          score: newMetadata.score,
          title: newMetadata.name,
          filename: newMetadata.filename,
          analysis: newMetadata.analysis,
          component: FileViewTable,
          extraHeaders: newMetadata.columns.split(",").map(x => {
            return this.parseFieldName(x.trim());
          })
        });
        savedTabs.push(newMetadata);
      } else {
        // tabIndex is not -1: we are editing an old tab.
        if (newMetadata.delete) {
          // delete an old tab, but only if there are more than one tab
          if (this.tabs.length > 1) {
            this.tabs.splice(newMetadata.tabIndex, 1);
            savedTabs.splice(newMetadata.tabIndex, 1);
          } else {
            this.$emit("web-error", "The last tab cannot be deleted.");
          }
        } else {
          // update a tab
          this.tabs[newMetadata.tabIndex].icon = newMetadata.icon;
          this.tabs[newMetadata.tabIndex].score = newMetadata.score;
          this.tabs[newMetadata.tabIndex].filename = newMetadata.filename;
          this.tabs[newMetadata.tabIndex].analysis = newMetadata.analysis;
          this.tabs[
            newMetadata.tabIndex
          ].extraHeaders = newMetadata.columns.split(",").map(x => {
            return this.parseFieldName(x.trim());
          });
          savedTabs[newMetadata.tabIndex] = newMetadata;
        }
      }

      // try to save the new tabs in the index metadata. Errors are ignored
      let tabs = [];
      savedTabs.forEach(tab => {
        let simpleTabInfo = Object.assign({}, tab);
        // remove these fields before saving
        delete simpleTabInfo.component;
        delete simpleTabInfo.extraHeaders;
        delete simpleTabInfo.tabIndex;
        tabs.push(simpleTabInfo);
      });
      this.$store.dispatch("sources/editSource", {
        idx: 0,
        newMetadata: { tabs }
      });
    },

    /** Parses a field name, returning the name and the sort property (if provided)
     * @param {String} fieldname - format "name/sort". If sort is not provided, assume "name.keyword"
     * @returns {text, sort}
     */
    parseFieldName(fieldname) {
      let parsed = fieldname.split("/", 2);
      if (parsed.length == 1)
        return { text: fieldname, sort: `${fieldname}.keyword` };
      return { text: parsed[0], sort: parsed[1] };
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
          `Metadata saved: ${source._source.source}`,
          "info"
        );
      }
    }
  }
};
</script>
