<template>
  <v-data-iterator :items="stats" hide-default-footer>
    <template v-slot:default="props">
      <v-row>
        <v-col v-for="item in props.items" :key="item.key" sm="6" md="4" lg="3">
          <v-list dense>
            <v-list-item>
              <v-list-item-content>
                <b>{{ item.key }}:</b>
              </v-list-item-content>
              <v-list-item-content class="align-end">
                {{ item.count }}
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-col>
      </v-row>
    </template>
  </v-data-iterator>
</template>

<script>
/** A simple data-table to show an array of objects.
 * Each row has two columns: field name and field value.
 * @module components/StatsTable
 * @vue-prop {Array} stats - The array to show on the table.
 */
export default {
  props: {
    stats: {
      type: Array,
      mandatory: true,
      default() {
        return [];
      }
    }
  }
};
</script>
