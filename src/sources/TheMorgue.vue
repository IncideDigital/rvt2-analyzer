<template>
  <v-card>
    <v-card-title>
      Directory: {{ cwd }} <small>Parent: {{ parent }}</small>
      <v-spacer></v-spacer>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
    </v-card-title>
    <small>{{ $store.state.config.RVT2FILES }} </small>
    <v-data-table
      dense
      disable-pagination
      hide-default-footer
      :headers="headers"
      :items="content"
      item-key="name"
      :search="search"
      class="elevation-1"
    >
      <template v-slot:item.ctime="{ item }">
        {{ printableUnixTime(item.ctime) }}
      </template>
      <template v-slot:item.atime="{ item }">
        {{ printableUnixTime(item.atime) }}
      </template>
      <template v-slot:item.mtime="{ item }">
        {{ printableUnixTime(item.mtime) }}
      </template>
      <template v-slot:item.icon="{ item }">
        <span :class="'pointable ' + iconClass(item)" @click="onClickItem(item)"
          >&nbsp;</span
        >
      </template>
      <template v-slot:item.name="{ item }">
        <a
          :href="rvt2client.toServerPath(cwd, item.name)"
          @click.prevent.stop="onClickItem(item)"
          >{{ item.name }}</a
        >
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import icons from "file-icons-js";
import Console from "@/lib/Console.js";
import { RVT2Client } from "@/lib/rvt2client.js";
import { showMessage } from "@/store/modules/messages.js";

/** List files in a source.
 *
 * @module management/TheMorgue
 * @vue-prop {String} - The current casename
 * @vue-prop {String} - The current source
 * @vue-data {String} cwd - The current dirname (equivalent to cwd).
 * @vue-data {Array} headers - The header configuration for vuetify data-table.
 * @vue-data {Array} content - The content, as retuned by the rvt2 daemon
 * @vue-data {String} parent - The parent of the current directory
 * @vue-data {String} search - Filter the table using this string
 * @vue-data {String} rvt2client - A client to connect to a RVT2 server
 */

export default {
  props: {
    casename: {
      mandatory: true,
      type: String,
      default: () => ""
    },
    source: {
      mandatory: true,
      type: String,
      default: () => ""
    }
  },

  data: () => {
    return {
      cwd: "",
      content: [],
      headers: [
        { text: "", sortable: false, value: "icon" },
        { text: "Name", sortable: true, value: "name" },
        { text: "Mode", sortable: true, value: "mode" },
        { text: "UID", sortable: true, value: "uid" },
        { text: "GID", sortable: true, value: "gid" },
        { text: "Created", sortable: true, value: "ctime" },
        { text: "Modified", sortable: true, value: "mtime" },
        { text: "Accessed", sortable: true, value: "atime" }
      ],
      search: "",
      parent: "",
      rvt2client: null
    };
  },

  async mounted() {
    if (!this.casename || !this.source) {
      showMessage(
        this.$store.commit,
        "Casename or source not provided",
        "error"
      );
      return;
    }
    this.$store.commit("casename", this.casename, { root: true });
    this.$store.commit("source", this.source, { root: true });

    this.rvt2client = new RVT2Client(
      this.$store.state.config.RVT2FILES,
      this.casename,
      this.source
    );
    this.cdDirectory(this.cwd);
  },

  methods: {
    /** Returns the icon for an item: directory, use library icons or simple file */
    iconClass(item) {
      if (item.type === "directory") return "mdi mdi-folder";
      let customIcon = icons.getClassWithColor(item.name);
      if (customIcon) return `${customIcon} iconByName`;
      return "mdi mdi-file-outline";
    },

    onClickItem(item) {
      if (!this.rvt2client) return;
      if (item.name === "..") {
        this.cdDirectory(this.parent);
      } else if (item.type === "directory") {
        this.cdDirectory(this.toAbsoluteDirname(item.name));
      } else {
        this.downloadFile(this.cwd, item.name);
      }
    },

    toAbsoluteDirname(relativePath) {
      return this.cwd ? `${this.cwd}/${relativePath}` : relativePath;
    },

    async cdDirectory(absdirname) {
      const dirinfo = await this.rvt2client.getDirectory(absdirname);
      this.content = dirinfo.content;
      this.parent = dirinfo.parent;
      this.cwd = absdirname;
    },

    async downloadFile(dirname, filename) {
      await this.rvt2client.downloadFile(dirname, filename);
    },

    /** Converts a UNIX timestamp into human readable and sortable string */
    printableUnixTime(date) {
      if (date) return new Date(date * 1e3).toISOString();
      return "";
    }
  }
};
</script>
