<template>
  <v-data-table
    id="file-view-table"
    :headers="customHeaders"
    :items="results"
    class="elevation-1"
    hide-default-footer
    dense
    :server-items-length="resultNumber"
    :sort-by.sync="sortBy"
    :loading="runningQuery"
    show-expand
    calculate-widths
    @update:sort-desc="updateSortDesc"
  >
    <template v-slot:item="{ item, index, isExpanded }">
      <tr>
        <td>
          <v-icon small @click="itemExpanded({ item, value: !isExpanded })"
            >mdi-information</v-icon
          >
        </td>
        <td v-if="filename">
          <document-link :server="sourceServer" :docinfo="item._source" />
        </td>

        <td v-if="score">
          {{ item._score }}
        </td>
        <td v-for="extra in extraHeaders" :key="extra.text">
          <span v-if="extra.text == '_id'">
            {{ getItemData(item, "_id", 22) }}
          </span>
          <span v-else :title="getItemData(item._source, extra.text)">{{
            getItemData(item._source, extra.text, 22)
          }}</span>
        </td>
        <td>
          <!-- preview items with a preview path -->
          <template v-if="item._source.preview">
            <v-img
              :src="sourceServer + '/' + item._source.preview"
              aspect-ratio="1"
              class="grey lighten-2"
              :max-width="imageWidth"
              :max-height="imageHeight"
            >
              <template v-slot:placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center">
                  <v-progress-circular
                    indeterminate
                    color="grey lighten-5"
                  ></v-progress-circular>
                </v-row>
              </template>
            </v-img>
          </template>
          <!-- preview images without a container (notice double equals to match "0" and 0) -->
          <template
            v-else-if="
              item._source.category === 'image' && item._source.containerid == 0
            "
          >
            <v-img
              :src="sourceServer + '/' + item._source.path"
              aspect-ratio="1"
              class="grey lighten-2"
              :max-width="imageWidth"
              :max-height="imageHeight"
            >
              <template v-slot:placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center">
                  <v-progress-circular
                    indeterminate
                    color="grey lighten-5"
                  ></v-progress-circular>
                </v-row>
              </template>
            </v-img>
          </template>
          <!-- preview anything else: results from highlight -->
          <template v-else>
            <highlight-hits :highlight="item.highlight" />
          </template>
        </td>
        <td v-if="analysis">
          <tag-editor
            :tags="item._source.tags"
            :data-index="index"
            @update-tags="updateTags"
          />
        </td>
        <td v-if="analysis">
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn
                text
                small
                v-on="on"
                @click="
                  $emit('request-edit-column', {
                    idx: index,
                    name: 'comment'
                  })
                "
              >
                <v-icon v-if="item._source.comment"
                  >mdi-comment-eye-outline</v-icon
                >
                <v-icon v-else>mdi-comment</v-icon>
              </v-btn>
            </template>
            <span>Edit comments</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn
                text
                small
                v-on="on"
                @click="$emit('request-edit-column', { idx: index })"
              >
                <v-icon>mdi-table-column-plus-after</v-icon>
              </v-btn>
            </template>
            <span>Add or edit column</span>
          </v-tooltip>
        </td>
      </tr>
    </template>

    <template v-slot:expanded-item="{ headers, item }">
      <td :colspan="headers.length">
        <document-info :docinfo="item" />
      </td>
    </template>
  </v-data-table>
</template>

<script>
/** @module search/DocumentViewTable */

/** Ask the controller to sort results using this name and descending.
@event search/DocumentViewTable#sort-results
@type {object}
@property {String} sortBy - Name of the column to sort by.
@property {Boolean} descending - If true, descending sort
*/

/** Ask the listener to show a dialog to edit a column of a document.
@event search/DocumentViewTable#request-edit-column
@type {object}
@property {Number} idx - The index in the results array of the document to request
@property {String} name - The name of the column to edit
*/

/** Ask the controller to save a column of a document
@event search/DocumentViewTable#save-column
@type {object}
@property {Number} idx - The index in the results array of the document to request
@property {String} name - The name of the column to edit
@property {String} value - The new value of the column
*/

/** Ask the controller to show information about an item
@event search/DocumentViewTable#show-document
@type {object}
*/

import { mapState } from "vuex";
import DocumentLink from "./DocumentLink.vue";
import DocumentInfo from "./DocumentInfo.vue";
import HighlightHits from "./HighlightHits.vue";
import TagEditor from "./TagEditor.vue";
import Console from "@/lib/Console.js";

/** A Vue component to show the results of a search in a sortable and paginated table with configurable columns.
 *
 * Computed properties from vuex state:
 *
 * - results: {@link store/modules/searches}
 *
 * @vue-prop {Boolean} score - If true, show the score column.
 * @vue-prop {Boolean} filaname - If true, show the column filename.
 * @vue-prop {Boolean} analysis - If true, show the analysis columns: tags and actions.
 * @vue-prop {Array} results - The results to show.
 * @vue-prop {String} sourceServer - The file server to access directly to the files.
 * @vue-prop {Array} extraHeaders - An array of strings with the name of the columns in results._source to show and the column to use for sorting.
 * @fires search/DocumentViewTable#sort-results
 * @fires search/DocumentViewTable#request-edit-column
 * @fires search/DocumentViewTable#save-column
 * @fires search/DocumentViewTable#show-document
 */
export default {
  components: {
    DocumentLink,
    DocumentInfo,
    TagEditor,
    HighlightHits
  },

  props: {
    score: {
      type: Boolean,
      default: false
    },
    filename: {
      type: Boolean,
      default: true
    },
    analysis: {
      type: Boolean,
      default: true
    },
    sourceServer: {
      type: String,
      default: "http://localhost"
    },
    extraHeaders: {
      type: Array,
      default: function() {
        return [];
      }
    },
    imageWidth: {
      mandatory: false,
      type: Number,
      default: () => 160
    },
    imageHeight: {
      mandatory: false,
      type: Number,
      default: () => 120
    }
  },

  data() {
    return {
      myResults: [],
      expanded: [],
      sortBy: "_score"
    };
  },

  computed: {
    /** @return An array of the headers to show, as needed by vuetify */
    customHeaders() {
      var h = [];
      //h.push({ text: "", value: "info", sortable: false, width: "1%" });
      h.push({
        text: "",
        value: "data-table-expand",
        sortable: false,
        width: "1%"
      });
      if (this.filename) {
        h.push({ text: "Filename", value: "filename", sorteable: true });
      }
      if (this.score) {
        h.push({
          text: "Relevance",
          value: "_score",
          sortable: true
        });
      }
      for (let i = 0; i < this.extraHeaders.length; i++) {
        if (this.extraHeaders[i].sort !== undefined) {
          h.push({
            text: this.extraHeaders[i].text,
            value: this.extraHeaders[i].sort,
            width: "10%",
            sortable: true
          });
        } else {
          h.push({
            text: this.extraHeaders[i].text,
            value: this.extraHeaders[i].text,
            width: "10%",
            sortable: false
          });
        }
      }
      h.push({ text: "Preview", value: "preview", sortable: false });
      if (this.analysis) {
        h.push({ text: "Tags", value: "tags", sortable: false });
        h.push({
          text: "Actions",
          value: "actions",
          sortable: false
        });
      }
      return h;
    },
    ...mapState("searches", ["results", "resultNumber", "runningQuery"])
  },

  methods: {
    /** Convert tags to lowercase, remove duplicates and Fires an event to update the tags of a document.
     * @param {Number} dataIndex - The index of the document to change in the results array
     * @param {Array} tags - An array of tags to save in a document
     */
    updateTags({ dataIndex, tags }) {
      let lowerTags = [];
      if (tags !== undefined) {
        lowerTags = Array.from(new Set(tags.map(item => item.toLowerCase())));
      }

      this.$emit("save-column", {
        idx: dataIndex,
        name: "tags",
        value: lowerTags
      });
      this.$emit("save-column", {
        idx: dataIndex,
        name: "analyst",
        value: this.$store.state.analyst
      });
    },

    /**
     *
     * @param {Number} idx - The index of the document to check in the results array
     * @return True if there is a comment in this document. Reactivity, slots and v-if, v-else make difficult to check this in the templates.
     */
    hasComment(idx) {
      return (
        this.results[idx].comment !== undefined &&
        this.results[idx].comment !== ""
      );
    },

    /**
     * Get a data from an dictionary.
     * @param {Object} dictionary - The dictionary
     * @param {String} name - The name of the data. It might be composite: clientip, geoip.city_name...
     */
    getItemData(dictionary, name, truncate) {
      let current = dictionary;
      let data = current[name];
      if (data === undefined) {
        let components = name.split(".", 2);
        if (current[components[0]] === undefined) return undefined;
        data = this.getItemData(current[components[0]], components[1]);
      }
      if (truncate > 0) return this.truncateText(data, truncate);
      return data;
    },

    /** Truncates a text (string, number, whatever) to a max length.
     * If the text is truncated, '...' is appended to the end. */
    truncateText(text, length = 30) {
      if (text === undefined) {
        return text;
      }
      let strText = String(text);
      if (length < 3 || strText.length < length - 3) {
        return strText;
      }
      return strText.substring(0, length - 3) + "...";
    },

    /**
     * Listener for an event itemExpanded
     * @param item - The item that has been expanded
     * @param value - The index of the item in the array
     */
    async itemExpanded({ item, value }) {
      // TODO: not working: expand all of them. Add expanded.sync=expanded to the table for testing
      if (value) {
        this.expanded.push(item);
        this.$emit("show-document", item);
      } else {
        this.expanded.pop(item);
      }
    },

    /** Get an event: the order has changed. Fires an event to request a change in the sort order
     * @param {String} event - An array with just an element: whether the order is descending or not.
     */
    updateSortDesc(event) {
      this.$emit("sort-results", {
        sortBy: this.sortBy,
        descending: event[0]
      });
    }
  }
};
</script>
