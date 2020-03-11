<template>
  <div>
    <span v-for="(value, field) in highlight" :key="field">
      <em class="fieldname">{{ field }}</em
      >: <span class="hiresults" v-html="highlightToText(value)" />
    </span>
  </div>
</template>

<script>
/** A Vue component to show highlighted fields from an ElasticSearch result as a text.
 * @module search/HighlightHits
 * @vue-prop {Object} Highlight dictionary, as returned by elasticsearch
 */
export default {
  props: {
    highlight: {
      type: Object,
      default() {
        return null;
      }
    }
  },

  methods: {
    /** @return All fields joined and separated with a # */
    highlightToText: function(value) {
      if (value.constructor === Array) {
        return value.join('<span class="separator">#</span>');
      }
      return value;
    }
  }
};
</script>

<style>
.fieldname {
  font-weight: bold;
  margin-left: 1em;
}

.hiresults em {
  background-color: yellow;
  border: 1px solid #dddddd;
}
.hiresults .separator {
  background-color: #cdcdcd;
  color: white;
  border: 1px solid #dddddd;
  margin-right: 0.5em;
  margin-left: 0.5em;
}
</style>
