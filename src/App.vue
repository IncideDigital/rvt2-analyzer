<template>
  <v-app>
    <!-- Header -->
    <v-img src="assets/title-bg.jpg" max-height="100px" class="black">
      <v-container class="fill-height">
        <v-row align="center">
          <v-col>
            <router-link :to="{ name: 'home' }" class="page-header">
              <h1>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }"
                    ><span v-on="on">{{ getTitle() }}</span></template
                  >
                  <span>Go back to the welcome page</span>
                </v-tooltip>
              </h1>
            </router-link>
          </v-col>
        </v-row>
        <v-row align="center">
          <v-col v-if="$store.state.analyst" offset="8" class="analyst-name">
            Welcome, {{ $store.state.analyst }}!
          </v-col>
        </v-row>
      </v-container>
    </v-img>

    <v-snackbar
      v-model="msgError.visible"
      :color="msgError.type"
      top
      :timeout="msgError.timeout"
    >
      {{ msgError.message }}
      <v-btn dark text @click="msgError.visible = false">
        Close
      </v-btn>
    </v-snackbar>

    <v-content>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-content>

    <!-- debug -->
    <v-expansion-panels>
      <v-expansion-panel v-if="$store.state.config.ESDEBUG">
        <v-expansion-panel-header
          >Last ElasticSearch request</v-expansion-panel-header
        >
        <v-expansion-panel-content>
          <pre>
            <code>{{msgDebug}}</code>
          </pre>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- Footer -->
    <v-footer>
      <v-spacer />
      <p class="font-weight-thin caption">
        RVT2-analyzer {{ app_version }}. &copy; INCIDE Digital Data S.L.
        {{ new Date().getFullYear() }}
      </p>
    </v-footer>
  </v-app>
</template>

<script>
import Console from "@/lib/Console.js";

import { mapGetters } from "vuex";

/** The main Vue object, the container page of the application.
 *
 * This application works as a single page and it uses vue-router.
 * It also manages errors and debug messages in the main application store.
 *
 */
export default {
  data: function() {
    return {
      msgError: {
        visible: false,
        message: "",
        type: "error",
        timeout: 0
      },
      msgDebug: null // the debug message to show
    };
  },

  computed: {
    app_version() {
      if (process.env.NODE_ENV === "production") {
        return process.env.VUE_APP_VERSION;
      }
      return `${process.env.VUE_APP_VERSION}-${process.env.NODE_ENV}`;
    },
    ...mapGetters("messages", ["hasMessages", "lastMessage"])
  },

  watch: {
    /** If there is a new error, get it */
    hasMessages(value) {
      if (value) {
        let debug = this.lastMessage("debug");
        if (debug) {
          this.$store.commit("messages/popMessage", { type: "debug" });
          this.msgDebug =
            debug.type +
            " " +
            debug.esserver +
            "/" +
            debug.path +
            "\n" +
            JSON.stringify(debug.data, null, 2);
        }

        let info = this.lastMessage("info");
        if (info) {
          this.$store.commit("messages/popMessage", { type: "info" });
          this.showInfo(info);
        }

        let warning = this.lastMessage("warning");
        if (warning) {
          this.$store.commit("messages/popMessage", { type: "warning" });
          this.showWarning(warning);
        }

        let error = this.lastMessage("error");
        if (error) {
          this.$store.commit("messages/popMessage", { type: "error" });
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            if (error.response.status === 404) {
              this.showError(
                `Error 404: Is the index "${error.response.error.index}" available?`
              );
            } else {
              this.showError(
                error.response.status + ": " + JSON.stringify(error.response)
              );
            }
          } else if (typeof error === "object" && "request" in error) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            this.showError("No response from the ElasticSearch server.");
          } else {
            // Something happened in setting up the request that triggered an Error
            this.showError(error);
          }
        }
      }
    }
  },

  mounted() {
    // when the page changes, clean log and information messages but not errors or warnings
    this.$router.afterEach(() => {
      this.msgDebug = null;
      if (this.msgError.visible && this.msgError.type == "success") {
        this.msgError.visible = false;
      }
    });
  },

  methods: {
    /** Shows an error message */
    showError: function(msg) {
      Console.error(msg);
      this.msgError = {
        visible: true,
        type: "error",
        message: msg,
        timeout: 0
      };
    },

    /** Shows an info message. */
    showInfo: function(msg) {
      Console.info(msg);
      this.msgError = {
        visible: true,
        type: "success",
        message: msg,
        timeout: 6000
      };
    },

    /** Shows a warning message. */
    showWarning: function(msg) {
      Console.warning(msg);
      this.msgError = {
        visible: true,
        type: "warning",
        message: msg,
        timeout: 0
      };
    },

    /** Get the title of this section */
    getTitle() {
      if (this.$store.state.casename)
        if (this.$store.state.source)
          return `RVT2 Analyzer: ${this.$store.state.casename}: ${this.$store.state.source}`;
        else return `RVT2 Analyzer: ${this.$store.state.casename}`;
      return "RVT2 Analyzer";
    }
  }
};
</script>

<style>
.v-application--wrap {
  background-color: #e5e5e5;
}

.page-header {
  color: white !important;
  text-decoration: none;
}

.pointable {
  cursor: pointer;
}

.analyst-name {
  color: white !important;
  text-decoration: none;
}

.ellipsis {
  max-width: 15em;
  overflow: hidden;
  text-overflow: ellipsis;
}

.component-fade-enter-active,
.component-fade-leave-active {
  transition: opacity 0.3s ease;
}
.component-fade-enter, .component-fade-leave-to
/* .component-fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
