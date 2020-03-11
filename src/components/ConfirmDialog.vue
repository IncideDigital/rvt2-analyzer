<template>
  <v-container>
    <v-row>
      <v-dialog ref="popup" v-model="visible" max-width="390">
        <v-card>
          <v-card-title class="headline">{{ title }}</v-card-title>
          <v-card-text>{{ message }}</v-card-text>
          <v-card-actions>
            <v-btn color="secondary" text @click.native="click(true)">{{
              yes
            }}</v-btn>
            <v-spacer />
            <v-btn color="primary" text @click.native="click(false)">{{
              no
            }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </v-container>
</template>

<script>
/**
 * A Vue component to show a confirmation dialog
 *
 * @module components/ConfirmDialog
 * @vue-data {Boolean} visible=false - Wether the dialog is visible
 * @vue-data {Promise} resolve - The promise created in confirm()
 * @vue-prop {String} [no="Cancel"] - The text to show on the cancel button.
 * @vue-prop {String} [yes="OK"] - The text to show on the yes button
 * @vue-prop {String} [message="Are you sure?"] - The message to show on the dialog
 * @vue-prop {String} [title="Confirm"] - The dialog title
 */
export default {
  data: () => ({
    visible: false,
    resolve: null,
    title: "Confirm",
    yes: "OK",
    no: "Cancel",
    message: "Are you sure?"
  }),

  methods: {
    /** Show the dialog.
     * @param {Object} config - {title, message, yes, no}
     * @return A promise. You can use this promise with await. The promise will return true or false.
     */
    confirm(config) {
      this.title = config.title === undefined ? this.title : config.title;
      this.message =
        config.message === undefined ? this.message : config.message;
      this.yes = config.yes === undefined ? this.yes : config.yes;
      this.no = config.no === undefined ? this.no : config.no;

      this.visible = true;

      return new Promise(resolve => {
        this.resolve = resolve;
      });
    },

    /** Resolve the promise and close the dialog */
    click(result) {
      this.visible = false;
      this.resolve(result);
    }
  }
};
</script>
