<!-- Manages a dialog to change the index metadata. -->

<template>
  <v-dialog v-model="visible" max-width="1000px" persistent>
    <v-card>
      <v-card-title
        ><span v-if="document" class="headline"
          >Document {{ document._id }}</span
        ></v-card-title
      >
      <v-card-text>
        <file-info v-if="document" :fileinfo="document"></file-info>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="primary" text @click.native="close()">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import FileInfo from "./FileInfo.vue";

/**
 * A Vue component to show a dialog to edit the fields of any dictionary.
 *
 * @module search/DocumentDialog
 * @vue-data {Object} document - The document to show
 * @vue-data {Boolean} visible - Whether the dialog is visible or not.
 */
export default {
  components: {
    FileInfo
  },

  data() {
    return {
      visible: false,
      document: undefined
    };
  },

  methods: {
    /** Show the dialog.
     * @return A promise. You can use this promise with await.
     */
    show(document) {
      // show the dialog. Use as a promise or with await.
      this.document = document;
      this.visible = true;
      return new Promise(resolve => {
        this.resolve = resolve;
      });
    },

    /** Close the dialog and resolve the promise returned by the edit() method. */
    close() {
      this.resolve();
      this.visible = false;
    }
  }
};
</script>
