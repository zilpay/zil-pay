<template>
  <div>
    <BackBar/>

    <main class="animated fadeIn faster is-mini">
      <div class="change-net text-left"
           v-click-outside="dropdownClose">
        <div class="dropdown-el text-black"
             @click="isInput = !isInput">
          {{network}}
          <img src="/icons/drop-down-arrow.svg" height="15">
        </div>
        
        <div class="animated fadeIn fast dropdown-input text-black" v-show="isInput">
          <div class="item"
                v-for="item of networkItems"
                :key="item"
                @click="selectedNetwork(item)">
            <div class="name">{{item}}</div>
          </div>
        </div>
      </div>

      <div class="form-border net-form"
           v-for="item of networkItems" :key=item>
        <div>
          <label>{{item}}</label>
          <input type="text"
                 :disabled="item === 'mainnet'"
                 :value="networkConfig[item].PROVIDER"
                 @change="changeNetworkConfig(item, 'PROVIDER', $event.target.value)">
        </div>
        <div>
          <label>MSG ID</label>
          <input type="number"
                 :disabled="item === 'mainnet'"
                 :value="networkConfig[item].MSG_VERSION"
                 @change="changeNetworkConfig(item, 'MSG_VERSION', $event.target.value)">
        </div>
      </div>

      <button class="def" @click="toDefaultNetworkConfig">default</button>
    </main>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex';
import vClickOutside from 'v-click-outside';
import defaultConfig from '../../config/zil.json';
const BackBar = () => import('../components/BackBar');


export default {
  name: 'Networks',
  components: { BackBar },
  directives: {
    clickOutside: vClickOutside.directive
  },
  data() {
    return {
      isInput: false
    };
  },
  computed: {
    ...mapState('Static', [
      'network',
      'networkConfig'
    ]),

    networkItems() {
      return Object.keys(this.networkConfig);
    }
  },
  methods: {
    ...mapMutations(['spiner']),
    ...mapActions('Static', [
      'changeNetwork',
      'configUpdate'
    ]),

    async selectedNetwork(item) {
      this.spiner();
      await this.changeNetwork(item);
      this.isInput = false;
      this.spiner();
    },
    changeNetworkConfig(el, key, value) {
      let config = this.networkConfig;
      config[el][key] = value;
      this.configUpdate(config);
    },
    toDefaultNetworkConfig() {
      this.configUpdate(defaultConfig);
    },
    dropdownClose() {
      this.isInput = false;
    }
  }
}
</script>

<style lang="scss">
.change-net {
  padding: 30px;
}
.net-form {
  padding: 30px;
  margin: 30px;
  padding: 30px;
}

</style>