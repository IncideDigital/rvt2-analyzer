<template>
  <v-data-table
    item-key="_id"
    :headers="indexHeaders"
    :items="sources"
    class="elevation-1"
    :hide-default-header="!showHeaders"
    :expanded.sync="expanded"
    :single-expand="true"
    show-expand
    hide-default-footer
    disable-pagination
    @item-expanded="itemExpanded"
  >
    <template v-slot:item.name="{ item }">
      <router-link
        :to="{
          name: 'search',
          params: {
            casename: item._source.casename,
            source: item._source.name
          }
        }"
      >
        <v-tooltip bottom>
          <template v-slot:activator="{ on }"
            ><v-btn icon small v-on="on"
              ><v-icon>mdi-file-search-outline</v-icon></v-btn
            ></template
          ><span>Search indexed documents</span></v-tooltip
        >
      </router-link>
      <router-link
        :to="{
          name: 'morgue',
          params: {
            casename: item._source.casename,
            source: item._source.name
          }
        }"
      >
        <v-tooltip bottom>
          <template v-slot:activator="{ on }"
            ><v-btn icon small v-on="on"
              ><v-icon>mdi-file-cabinet</v-icon></v-btn
            ></template
          ><span>Browse mounted filesystem</span></v-tooltip
        >
      </router-link>
      {{ item._source.name }}
    </template>
    <template v-slot:item.casename="{ item }">
      <router-link
        :to="{
          name: 'caseinfo',
          params: {
            casename: item._source.casename
          }
        }"
        >{{ item._source.casename }}
      </router-link>
    </template>
    <template v-slot:item.description="{ item }">
      {{ item._source.description }}
    </template>
    <template v-slot:item.hours="{ item }">
      <span class="text-truncate">{{
        hoursEllapsed(item._source.started, item._source.ended)
      }}</span>
    </template>
    <template v-slot:item.server="{ item }">
      {{ item._source.server }}
    </template>
    <template v-slot:item.actions="{ item }">
      <v-row>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              icon
              small
              v-on="on"
              @click="$emit('edit-source', indexOfSource(item._source.name))"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </template>
          <span>Edit information about the source</span>
        </v-tooltip>
        <v-tooltip v-if="!disableRun" bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              icon
              small
              v-on="on"
              @click="$emit('run-job-source', item._source.name)"
            >
              <v-icon>mdi-run-fast</v-icon>
            </v-btn>
          </template>
          <span>Run a job on this source</span>
        </v-tooltip>
        <v-tooltip v-if="!disableDelete" bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              icon
              small
              v-on="on"
              @click="$emit('delete-source', indexOfSource(item._source.name))"
            >
              <v-icon color="red">mdi-delete-forever</v-icon>
            </v-btn>
          </template>
          <span>Delete information about the source</span>
        </v-tooltip>
      </v-row>
    </template>
    <template v-slot:expanded-item="{ headers }">
      <td :colspan="headers.length">
        <stats-table :stats="stats" />
      </td>
    </template>
  </v-data-table>
</template>

<script>
import StatsTable from "@/components/StatsTable.vue";
import Console from "@/lib/Console.js";

/**  This source must be deleted.
 * @event components/SourceTable#delete-source
 * @param {integer} type - The index of the source to edit
 */

/**  This source must be deleted.
 * @event components/SourceTable#edit-source
 * @param {integer} type - The index of the source to delete
 */

/**  Run a job on a source
 * @event components/SourceTable#run-job-source
 * @param {String} source - The name of the source
 */

/**
 * A Vue component to show a table of sources.
 *
 * @module components/SourceTable
 * @vue-prop {Array} sources - An array of sources to show, as returned by ElasticSearch in the field "hits"
 * @vue-prop {Boolean} complete - If true, show an extended version of the table
 * @vue-prop {Boolean} showHeaders - If true, show headers in the table
 * @vue-prop {Boolean} disableDelete - If true, disable delete metadata
 * @vue-prop {Boolean} disableRun - If true, disable run job
 * @vue-data {Array} stats - The stats of the selected source, to be shown on a StatsTable
 * @fires components/SourceTable#delete-source
 * @fires components/SourceTable#edit-source
 * @fires components/SourceTable#run-job-source
 */
export default {
  components: {
    StatsTable
  },

  props: {
    sources: {
      type: Array,
      mandatory: true,
      default() {
        return [];
      }
    },
    complete: {
      // if true, the table shows all columns.
      type: Boolean,
      default: false
    },
    showHeaders: {
      // if true, show header names
      type: Boolean,
      default: true
    },
    disableDelete: {
      type: Boolean,
      mandatory: false,
      default: () => false
    },
    disableRun: {
      type: Boolean,
      mandatory: false,
      default: () => false
    }
  },

  data: function() {
    return {
      stats: [],
      expanded: []
    };
  },

  computed: {
    indexHeaders() {
      if (this.complete) {
        return [
          // headers of the complete version
          { text: "Source", value: "name" },
          { text: "Description", value: "description", sortable: false },
          { text: "Server", value: "server" },
          { text: "Actions", value: "actions", sortable: false }
        ];
      }
      return [
        { text: "Source", value: "name" },
        { text: "Description", value: "description", sortable: false },
        { text: "Actions", value: "actions", sortable: false }
      ];
    }
  },

  methods: {
    /** Returns the number of hours between two dates */
    hoursEllapsed(started, ended) {
      if (ended === undefined || started === undefined) {
        return "-";
      } else {
        try {
          let date1 = new Date(ended);
          let date2 = new Date(started);
          let timeDiff = Math.abs(date1.getTime() - date2.getTime());
          let diffHours = timeDiff / (1000 * 3600);
          return diffHours.toFixed(2);
        } catch (err) {
          return "?";
        }
      }
    },

    /**
     * Listener for an event itemExpanded
     * @param item - The item that has been expanded
     * @param value - The index of the item in the array
     */
    async itemExpanded({ item, value }) {
      if (value) {
        this.stats = await this.$store.dispatch("sources/getStats", {
          name: item._source.name
        });
      }
    },

    /** Given the name of a source, returns the index in the sources array. */
    indexOfSource(name) {
      for (let i = 0; i < this.sources.length; i++) {
        if (this.sources[i]._source.name === name) {
          return i;
        }
      }
      return -1;
    }
  }
};
</script>
