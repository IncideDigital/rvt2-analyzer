<!-- Manages a dialog to change the index metadata. -->

<template>
  <v-dialog v-model="visible" max-width="500px" persistent>
    <v-card>
      <v-card-title
        ><span class="headline">{{ title }}</span></v-card-title
      >
      <v-card-text>
        <div v-for="field in fields" :key="field.name">
          <v-text-field
            v-if="field.type === 'textfield'"
            v-model="field.value"
            :label="getLabel(field)"
          />
          <v-textarea
            v-if="field.type === 'textarea'"
            v-model="field.value"
            :label="getLabel(field)"
          />
          <v-combobox
            v-if="field.type === 'tageditor'"
            v-model="field.value"
            :label="getLabel(field)"
            multiple
            chips
            tags
            clearable
            :prepend-icon="getPrependIcon(field)"
            append-icon=""
          >
            <template v-slot:selection="data">
              <base-tag :tag="data.item" />
            </template>
          </v-combobox>
          <!-- Use type 'hiden' for hiden values -->
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn color="secondary" text @click.native="close(false)">{{
          cancel
        }}</v-btn>
        <v-spacer />
        <v-btn color="primary" text @click.native="close(true)">{{
          save
        }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import BaseTag from "./BaseTag.vue";

/**
 * A Vue component to show a dialog to edit the fields of any dictionary.
 *
 * @module components/EditDataDialog
 * @vue-data {String} title="NO TITLE" - The title of the dialog
 * @vue-data {Array} fields - An array of objects {name, label, type, prependIcon}
 * @vue-data {Boolean} visible=false - Wether the dialog is visible
 * @vue-prop {String} [cancel="Cancel"] - The text to show on the cancel button.
 * @vue-prop {String} [save="Save"] - The Test to show on the save button
 */
export default {
  components: {
    BaseTag
  },

  props: {
    cancel: {
      type: String,
      mandatory: false,
      default: () => "Cancel"
    },
    save: {
      type: String,
      mandatory: false,
      default: () => "Save"
    }
  },

  data() {
    return {
      title: "NO TITLE",
      fields: [],
      visible: false
    };
  },

  methods: {
    /** Show the dialog.
     * @return A promise. You can use this promise with await.
     */
    edit({ title, fields }) {
      // show the dialog. Use as a promise or with await.
      this.title = title;
      this.fields = fields;
      this.visible = true;
      return new Promise(resolve => {
        this.resolve = resolve;
      });
    },

    /**
     * @return the label of a field, if provided. If not, return the name with the first letter uppercased.
     */
    getLabel(field) {
      if (field.label !== undefined) {
        return field.label;
      } else {
        return field.name.charAt(0).toUpperCase() + field.name.slice(1);
      }
    },

    /**
     * @return the prependIcon of the field, or an empty string if not provided.
     */
    getPrependIcon(field) {
      if (field.prependIcon !== undefined) {
        return field.prependIcon;
      } else {
        return "";
      }
    },

    /** Close the dialog and resolve the promise returned by the edit() method. */
    close(ok) {
      if (ok) {
        const newData = {};
        this.fields.forEach(field => {
          newData[field.name] = field.value;
        });
        this.resolve(newData);
        this.visible = false;
      } else {
        this.resolve(null);
        this.visible = false;
      }
    }
  }
};
</script>
