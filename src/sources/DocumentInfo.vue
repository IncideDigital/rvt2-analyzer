<!-- A table showing all available metadata for a document -->

<template>
  <v-simple-table dense>
    <tbody>
      <tr>
        <th>_id</th>
        <td>
          <!-- The identifier links to the document in elasticsearch -->
          <a
            :href="
              $store.state.config.ESSERVER +
                '/' +
                docinfo._index +
                '/' +
                docinfo._type +
                '/' +
                docinfo._id
            "
            target="_blank"
          >
            {{ docinfo._id }}
          </a>
        </td>
      </tr>
      <!-- The rest of the metadata -->
      <tr v-for="(item, index) in docinfo._source" :key="index">
        <template v-if="index !== 'content'">
          <th>{{ index }}</th>
          <td>{{ item }}</td>
        </template>
      </tr>
    </tbody>
  </v-simple-table>
</template>

<script>
export default {
  props: {
    docinfo: {
      // the docinfo object, as returned by elasticsearch in hits.hits._source
      type: Object,
      required: true
    }
  }
};
</script>
