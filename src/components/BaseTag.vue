<template>
  <v-chip
    small
    label
    :color="tagBackgroundColor"
    :text-color="tagTextColor"
    :close="close"
    class="mychip"
    @click:close="$emit('close-tag', tag)"
  >
    {{ tag | capitalize }}
  </v-chip>
</template>

<script>
/** @module components/BaseTag */

/**  This tag must be deleted.
 * @event components/BaseTag#close-tag
 * @type {object}
 * @property {String} tag - The name of the tag to remove.
 */

/**
 * A Vue component extending vuetify's v-chip to show corored tags.
 * @vue-prop {String} tag - The text to show on the tag
 * @vue-prop {Array} [dangerTags=config.IMPORTANT_LABELS] - An array of strings to be considered as "danger" tags
 * @vue-prop {Array} [warningTags=config.CHECK_LABELS] - An array of strings to be considered as "warning" tags
 * @vue-prop {Array} [successTags=config.SEEN_LABELS] - An array of strings to be considered as "success" tags
 * @vue-prop {Boolean} [close=false] - If true, the tag can be removed.
 * @fires components/BaseTag#close-tag
 */
export default {
  filters: {
    /** As seen in https://vuejs.org/v2/guide/filters.html
     * @param {String} value - A string to be capitalized.
     * @return The first letter of the text capitalized
     */
    capitalize: function(value) {
      if (!value) {
        return "";
      }
      value = value.toString();
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
  },
  props: {
    tag: {
      type: String,
      mandatory: true,
      default: function() {
        return "TAG";
      }
    },
    dangerTags: {
      type: Array,
      mandatory: false,
      default: function() {
        return this.$store.state.config.IMPORTANT_LABELS;
      }
    },
    warningTags: {
      type: Array,
      mandatory: false,
      default: function() {
        return this.$store.state.config.CHECK_LABELS;
      }
    },
    successTags: {
      type: Array,
      mandatory: false,
      default: function() {
        return this.$store.state.config.SEEN_LABELS;
      }
    },
    close: {
      type: Boolean,
      mandatory: false,
      default: false
    }
  },

  computed: {
    /** @return The type of the tag: 0, 1, 2, 3 === unknown, success, warning, danger. */
    tagType() {
      if (this.dangerTags.indexOf(this.tag.toLowerCase()) > -1) {
        return 3;
      } else if (this.warningTags.indexOf(this.tag.toLowerCase()) > -1) {
        return 2;
      } else if (this.successTags.indexOf(this.tag.toLowerCase()) > -1) {
        return 1;
      }
      return 0;
    },

    /** @return The background color of the current tag */
    tagBackgroundColor() {
      return ["grey", "green", "orange", "red"][this.tagType];
    },

    /** @return The text color of the current tag */
    tagTextColor() {
      return ["black", "white", "white", "white"][this.tagType];
    }
  }
};
</script>

<style scoped>
.mychip {
  margin: 0px !important;
  font-size: 12px !important;
}
</style>
