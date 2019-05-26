<template>
  <div>
    <BackBar/>

    <main>
      <div class="change-net text-left" @mouseleave="isInput = false">
        <div class="dropdown-el text-black" @click="isInput = !isInput">
          {{network}}
          <img src="/icons/drop-down-arrow.svg" height="15">
        </div>
        
        <div class="dropdown-input text-black" v-show="isInput">
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
import { mapState, mapMutations } from 'vuex'

const BackBar = () => import('../components/BackBar');


export default {
  name: 'Networks',
  components: { BackBar },
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
    ...mapMutations('Static', [
      'mutateNetwork',
      'mutateNetworkConfig',
      'toDefaultNetworkConfig'
    ]),

    selectedNetwork(item) {
      this.mutateNetwork(item);
      this.isInput = false;
    },
    changeNetworkConfig(el, key, value) {
      let config = this.networkConfig;
      config[el][key] = value;
      this.mutateNetworkConfig(config);
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
}

</style>