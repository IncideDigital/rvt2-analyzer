<template>
  <v-combobox
    v-model="myTags"
    label="Tags"
    multiple
    chips
    tags
    dense
    solo
    hide-details
    prepend-icon=""
    append-icon=""
    clearable
    @input="$emit('update-tags', { dataIndex: dataIndex, tags: myTags })"
  >
    <template v-slot:selection="data">
      <base-tag close :tag="data.item" @close-tag="deleteTag(data.item)" />
    </template>
  </v-combobox>
</template>

<script>
import BaseTag from "@/components/BaseTag";
import Console from "@/lib/Console.js";

/**
 * @event  search/TagEditor#update-tags
 * @type {object}
 * @property {Number} dataIndex - The index of the document in the results array
 * @propery {tags} tags - The new tags to save in the document
 */

/** A Vue component to show and edit a list of tags for a document.
 * @module search/TagEditor
 * @vue-prop {Number} dataIndex - The index of the document in the results array
 * @vue-prop {Array} tags - The initial tags of the object
 * @vue-data {Array} myTags - An internal representation of the tags of a document
 * @fires  search/TagEditor#update-tags */
export default {
  components: {
    "base-tag": BaseTag
  },

  props: {
    dataIndex: {
      type: Number,
      default() {
        return 0;
      }
    }, // The index of the result in the results array
    tags: {
      type: Array,
      default() {
        return [];
      }
    }
  },

  data: function() {
    return {
      myTags: [] // the internal tags, to be used as a cache in this component
    };
  },

  created: function() {
    // use myTags as a cache
    if (this.tags === undefined) {
      this.myTags = [];
    } else {
      this.myTags = this.tags;
    }
  },

  methods: {
    /** Delete a tag.
     * @prop {String} tag - The tag to delete, if exists.
     * @fires  search/TagEditor#update-tags
     */
    deleteTag: function(tag) {
      // delete tag event with splice, to allow vue to continue watching the array
      this.myTags.splice(this.myTags.indexOf(tag), 1);
      this.myTags = [...this.myTags];
      this.$emit("update-tags", {
        dataIndex: this.dataIndex,
        tags: this.myTags
      });
    }
  }
};
</script>
