<!-- Manages a dialog to change the tabs assotiated to an index

Events:

- save-tab(newMetadata). The dialog is closed. If newMetadata === undefined, the edition was canceled

-->

<template>
  <v-card>
    <v-card-title><span class="headline">Edit Tab</span></v-card-title>
    <v-card-text>
      <v-text-field
        v-model="name"
        label="Name"
        @change="changeInfo"
      ></v-text-field>
      <v-text-field v-model="icon" label="Material icon name"></v-text-field>
      <v-text-field
        v-model="columns"
        label="Comma separated list of columns to show"
      ></v-text-field>
      <v-checkbox v-model="score" label="Show relevance" />
      <v-checkbox v-model="filename" label="Show filename" />
      <v-checkbox
        v-model="analysis"
        label="Show analysis columns: actions and tags"
      />
    </v-card-text>
    <v-card-actions>
      <v-btn color="warning" text @click.native="saveTab(true)">Delete</v-btn>
      <v-spacer />
      <v-btn color="primary" text @click.native="saveTab(false)">Save</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  props: {
    tabs: {
      // list of current tabs
      type: Array,
      required: true
    }
  },
  data: function() {
    return {
      name: "",
      columns: "",
      icon: "",
      score: true,
      filename: true,
      analysis: true,
      tabIndex: -1
    };
  },

  methods: {
    changeInfo: function() {
      this.name = this.name.toUpperCase();
      for (let i = 0; i < this.tabs.length; i++) {
        if (this.name === this.tabs[i].name) {
          this.icon = this.tabs[i].icon;
          this.columns = this.tabs[i].extraHeaders.map(x => x.text).join(",");
          this.score = this.tabs[i].score;
          this.filename = this.tabs[i].filename;
          this.analysis = this.tabs[i].analysis;
          this.tabIndex = i;
          return;
        }
      }
      this.tabIndex = -1;
    },

    saveTab: function(deleteTab) {
      let newMetadata = {
        tabIndex: this.tabIndex,
        name: this.name,
        icon: this.icon,
        columns: this.columns,
        score: this.score,
        analysis: this.analysis,
        filename: this.filename,
        delete: deleteTab
      };
      this.$emit("save-tab", newMetadata);
      // after saving, empty the form
      this.name = this.columns = this.icon = "";
      this.score = this.analysis = this.filename = true;
      this.tabIndex = -1;
    }
  }
};
</script>
