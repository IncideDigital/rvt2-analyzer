<template>
  <v-form v-model="valid">
    <v-container fluid>
      <v-row>
        <v-col cols="3" md="2" lg="2">
          <v-select
            v-model="queryType"
            :items="availableQueryTypes"
            label="Type"
            single-line
            :rules="typeRules"
          />
        </v-col>
        <v-col cols="9" md="10" lg="7">
          <v-text-field
            v-model="query"
            label="Query"
            :rules="queryRules"
            :disabled="runningQuery"
            @keyup.enter="submit"
          />
        </v-col>
        <v-col>
          <v-btn
            color="primary"
            :disabled="runningQuery || !valid"
            @click="submit()"
          >
            <v-icon class="hidden-md-and-down">mdi-search</v-icon> Search
          </v-btn>
        </v-col>
        <v-col>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn
                color="secondary"
                :disabled="runningQuery || !valid"
                v-on="on"
                @click="tagAll()"
              >
                <v-icon class="hidden-md-and-down">mdi-tag-multiple</v-icon> Tag
              </v-btn>
            </template>
            <span>Query and tag</span>
          </v-tooltip>
        </v-col>
        <v-col>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn color="secondary" v-on="on" @click="showHelp = true">
                <v-icon class="hidden-md-and-down">mdi-help</v-icon> Help
              </v-btn>
            </template>
            <span>Show help fot the current query type</span>
          </v-tooltip>
        </v-col>
      </v-row>
    </v-container>

    <v-dialog v-model="showHelp" max-width="600px" persistent>
      <v-card>
        <v-card-title
          ><h5 class="headline">
            Help for query type: {{ queryType }}
          </h5></v-card-title
        >
        <v-card-text>
          <v-container class="fill-height" fluid>
            <v-row class="fill-height">
              <v-col class="align-end flexbox" cols="12">
                <help-message :query-type="queryType" />
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" text @click.native="showHelp = false"
            >Close</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <edit-data-dialog ref="editDataDialog" save="Query and tag" />
  </v-form>
</template>

<script>
import HelpMessage from "./HelpMessage.vue";
import EditDataDialog from "@/components/EditDataDialog.vue";
import { mapState } from "vuex";

/** Ask the controller to run a query
@event search/QueryForm#query
@type {object}
@property {String} queryType - The type of query
@property {String} query - The query text
*/

/** Ask the controller to tag all results of a query
@event search/QueryForm#query-and-tag
@type {object}
@property {String} queryType - The type of query
@property {String} query - The query text
@property {String} tags - The tags to append to the results
*/

/**
 * A Vue component to show a form to query ElasticSearch.
 *
 * Computed properties from vuex state:
 *
 * - runningQuery: {@link store/modules/searches}
 * - lastQueryData: {@link store/modules/searches}
 *
 * @module search/QueryForm
 * @vue-prop {Array} availableQueryTypes - List of available query types (strings). Required.
 * @vue-data {Boolean} valid -
 * @vue-data {String} queryType - Current query type
 * @vue-data {Array} queryRules -
 * @vue-data {Boolean} showHelp - If true, show a help dialog fot the current query type
 * @fires search/QueryForm#query
 * @fires search/QueryForm#query-and-tag
 */
export default {
  components: {
    HelpMessage,
    EditDataDialog
  },

  props: {
    availableQueryTypes: {
      type: Array,
      required: true
    }
  },

  data: function() {
    return {
      valid: false,
      queryType: null,
      typeRules: [v => !!v || "You must select a query type"],
      query: "*",
      queryRules: [v => !!v || "The query cannot be empty"],
      showHelp: false
    };
  },

  computed: {
    ...mapState("searches", ["lastQueryData", "runningQuery"])
  },

  mounted: function() {
    // once mounted, select the first available queryType
    this.queryType = this.availableQueryTypes[0];
  },

  methods: {
    /** @fires search/QueryForm#query */
    submit() {
      this.$emit("query", { queryType: this.queryType, query: this.query });
    },

    /** Show a dialog requesting tags.
     * @fires search/QueryForm#query-and-tag */
    async tagAll() {
      let params = {
        title: "Query and tag documents",
        fields: [
          {
            name: "tags",
            value: [],
            type: "tageditor",
            prependIcon: "mdi-tag-multiple"
          }
        ]
      };
      let newMetadata = await this.$refs.editDataDialog.edit(params);
      if (newMetadata) {
        this.$emit("query-and-tag", {
          queryType: this.queryType,
          query: this.query,
          tags: newMetadata.tags
        });
      }
    }
  }
};
</script>
