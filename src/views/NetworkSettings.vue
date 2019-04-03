<template>
  <div class="container">
    <div class="row justify-content-center">
      <h5 class="mr-auto p-2 point text-warning"
          @click="$router.go(-1)">&#60;BACK</h5>
      <h5 class="col-lg-12 text-pink">
        Network settings
      </h5>

      <div v-for="net of Object.keys(config)"
           :key="net" class="col-sm pt-3">
        <label :for="net">{{net}}</label>
        <input type="text"
               class="form-control bg-null text-pink"
               :id="net"
               :value="config[net].PROVIDER"
               @change="changeNodeUrl(net, $event.target.value)">
      </div>

      <div class="error text-danger pl-3 p-2" v-if="errorMsg">
        {{errorMsg}}
      </div>

      <button v-btn="'info btn-lg btn-block mt-4 btn-update'"
              :disabled="!!errorMsg"
              @click="changeNode(netConfig)">
          UPDATE
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import btn from '../directives/btn'
import { validateURL } from '../lib/utils'


export default {
  name: 'NetworkSettings',
  directives: { btn },
  data() {
    return {
      netConfig: {},
      errorMsg: null
    };
  },
  computed: {
    ...mapState('storage', [
      'selectednet',
      'config'
    ])
  },
  methods: {
    ...mapActions('storage', [
      'configUpdate',
      'changeNetwork'
    ]),

    changeNodeUrl(net, nodeURL) {
      if (!this.config.hasOwnProperty(net)) {
        return null;
      }

      if (validateURL(nodeURL)) {
        this.errorMsg = null;
        this.netConfig[net].PROVIDER = nodeURL;
      } else {
        this.errorMsg = 'Incorrect nodeURL';
      }
    },
    async changeNode() {
      await this.configUpdate(this.netConfig);
      await this.changeNetwork(this.selectednet);
      this.$router.push({ name: 'home' });
    }
  },
  mounted() {
    this.netConfig = this.config;
  }
}
</script>

<style>
.btn-update {
  width: 200px;
}
</style>
