<!-- A table showing all available metadata for a document -->

<template>
  <v-simple-table dense>
    <tbody>
      <tr>
        <th>ID</th>
        <td>
          <!-- The identifier links to the document in elasticsearch -->
          <a
            :href="
              $store.state.config.ESSERVER +
                '/' +
                fileinfo._index +
                '/' +
                fileinfo._type +
                '/' +
                fileinfo._id
            "
            target="_blank"
          >
            {{ fileinfo._id }}
          </a>
        </td>
      </tr>
      <!-- The rest of the metadata -->
      <tr v-for="(item, index) in fileinfo._source" :key="index">
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
    fileinfo: {
      // the fileinfo object, as returned by elasticsearch in hits.hits._source
      type: Object,
      required: true
    }
  }
};
</script>
