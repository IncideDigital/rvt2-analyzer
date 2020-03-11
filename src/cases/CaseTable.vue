<template>
  <v-data-table
    item-key="_id"
    :headers="indexHeaders"
    :items="cases"
    class="elevation-1"
    hide-default-footer
    disable-pagination
    :search="search"
  >
    <template v-slot:item.name="{ item }">
      <router-link
        v-if="item._source.name"
        :to="{ name: 'caseinfo', params: { casename: item._source.name } }"
        >{{ item._source.name }}</router-link
      >
    </template>
    <template v-slot:item.casename="{ item }">
      {{ item._source.casename }}
    </template>
    <template v-slot:item.description="{ item }">
      {{ item._source.description }}
    </template>
    <template v-slot:item.actions="{ item }">
      <v-row v-if="!noModifications">
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              icon
              small
              :disabled="noModifications"
              v-on="on"
              @click="$emit('edit-case', indexOfCase(item._source.name))"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </template>
          <span>Edit information about the case</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-btn
              icon
              small
              :disabled="noModifications"
              v-on="on"
              @click="$emit('delete-case', indexOfCase(item._source.name))"
            >
              <v-icon color="red">mdi-delete-forever</v-icon>
            </v-btn>
          </template>
          <span>Delete information about the case</span>
        </v-tooltip>
      </v-row>
    </template>
  </v-data-table>
</template>

<script>
import Console from "@/lib/Console.js";

/**  This vase must be deleted.
 * @event components/CaseTable#delete-case
 * @param {integer} type - The index of the case to edit
 */

/**  This case must be deleted.
 * @event components/CaseTable#edit-case
 * @param {integer} type - The index of the case to delete
 */

/**
 * A Vue component to show a table of cases.
 *
 * @module components/CaseTable
 * @vue-prop {Array} cases - An array of cases to show, as returned by ElasticSearch in the field "hits"
 * @vue-prop {Boolean} noModifications - If set, do not allow modifications of the table
 * @vue-data {Array} stats - The stats of the selected case, to be shown on a StatsTable
 * @fires components/CaseTable#delete-case
 * @fires components/CaseTable#edit-case
 */
export default {
  props: {
    cases: {
      type: Array,
      mandatory: true,
      default() {
        return [];
      }
    },
    noModifications: {
      // if set, do not allow modifications on the metadata
      type: Boolean,
      default: false
    },
    search: {
      type: String,
      mandatory: false,
      default: () => ""
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
      return [
        // headers of the simplified version
        {
          text: "Name",
          value: "name",
          sortable: true,
          filter: this.customFilter
        },
        {
          text: "Description",
          value: "description",
          sortable: false,
          filter: this.customFilter
        },
        {
          text: "Actions",
          value: "actions",
          sortable: false,
          filterable: false
        }
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

    /** Given the name of a case, returns the index in the cases array. */
    indexOfCase(name) {
      for (let i = 0; i < this.cases.length; i++) {
        if (this.cases[i]._source.name === name) {
          return i;
        }
      }
      return -1;
    },

    customFilter(value, search, item) {
      if (!search) return true;
      return (
        item._source.name.toUpperCase().includes(search.toUpperCase()) ||
        item._source.description.toUpperCase().includes(search.toUpperCase())
      );
    }
  }
};
</script>
