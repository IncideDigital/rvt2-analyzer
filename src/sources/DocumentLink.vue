<!-- Renders a link for a document: from the filename to the real document.

The filename of a document is always the filename of the container. The
container is the file to open, if necessary.

The root document is also its container. For documents inside other documents
(such as images in Word documents, or files in a ZIP docoment), the field
embedded_path is defined, and this is the real name of the file.

 -->

<template>
  <span class="filenameLink">
    <span :class="iconClass"></span>&nbsp;
    <a :href="server + '/' + docinfo.path" target="_blank">{{
      realFilename
    }}</a>
    <span v-if="docinfo.embedded_path">
      (inside <em>{{ docinfo.filename }}</em
      >)</span
    >
  </span>
</template>

<script>
import "file-icons-js/css/style.css";
import icons from "file-icons-js";

import "@mdi/font/css/materialdesignicons.min.css";

// if a custom icon is not included but the file has a category defined, use these icons
var categoryIcons = {
  multimedia: "mdi mdi-file-image medium-orange",
  office: "mdi mdi-file-word medium-red",
  email: "mdi mdi-email-outline medium-red",
  plain: "mdi mdi-note-text medium-red"
};

export default {
  props: {
    docinfo: {
      // the information about the file, as returned by ElasticSearch in hits.hits._source
      type: Object,
      required: true
    },
    server: {
      // the URL of the server to access this resource
      type: String,
      default: ""
    }
  },

  computed: {
    realFilename() {
      if (this.docinfo.embedded_path !== undefined) {
        return this.docinfo.embedded_path;
      } else {
        return this.docinfo.filename;
      }
    },

    iconClass() {
      var customIcon = icons.getClassWithColor(this.realFilename);
      if (customIcon) {
        return `${customIcon} iconByName`;
      }
      // no custom icon: check the category
      if (this.docinfo.category) {
        return categoryIcons[this.docinfo.category];
      }
      return "";
    }
  }
};
</script>

<style>
/* Add a little marker if the icon comes from the file category */
/*.filenameLink .mdi::after {
  font-family: "Material Design Icons";
  font-size: 50%;
  content: "\f830";
}*/
/* Add a little marker if the icon comes from the file name */
/*.filenameLink .iconByName::after {
  font-family: "Material Design Icons";
  font-size: 80%;
  content: "\f02c";
}*/
.filenameLink .mdi {
  font-size: 125%;
}
</style>
