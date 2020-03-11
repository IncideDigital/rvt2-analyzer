<!-- Asks for some configuration options -->

<template>
  <v-container>
    <v-col>
      <v-row justify="center" align="center">
        <v-card max-width="800">
          <v-card-title>System configuration</v-card-title>
          <v-card-text>
            <p>
              Welcome to RVT2 analyzer, an interface for a DFIR analysis of
              documents indexed in ElasticSearch.
            </p>
            <p>Please, tell me:</p>
            <v-form ref="form" v-model="valid" class="text-center">
              <v-text-field
                v-model="myAnalyst"
                label="Your name"
                hint="It will be used to identify your comments and annotations"
                prepend-icon="mdi-account-card-details-outline"
                :rules="[v => !!v || 'A name is required']"
                required
              />
              <v-text-field
                v-model="myEsserver"
                label="The URL to the ElasticSearch server"
                prepend-icon="mdi-server"
                :rules="[
                  v => !!v || 'The URL to an ElasticSearch server is required'
                ]"
                hint="Contact your system administrator to get this URL"
                required
              />
              <v-btn
                text
                type="submit"
                :disabled="!valid"
                color="primary"
                @click="submit"
              >
                <v-icon>mdi-login-variant</v-icon>&nbsp;Enter
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-row>
    </v-col>
  </v-container>
</template>

<script>
export default {
  data: function() {
    return {
      valid: false,
      myAnalyst: undefined,
      myEsserver: undefined
    };
  },

  mounted() {
    this.$store.commit("casename", null);
    this.$store.commit("source", null);
    this.myAnalyst = this.$store.state.analyst;
    this.myEsserver = this.$store.state.esserver;
  },

  methods: {
    submit: function() {
      // save the new values persistently
      this.$store.commit("analyst", this.myAnalyst);
      this.$store.commit("esserver", this.myEsserver);
      // move to the next page
      this.$router.push("/cases");
    }
  }
};
</script>
