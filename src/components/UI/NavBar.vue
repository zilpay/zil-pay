<template>
  <nav class="navbar navbar-inverse navbar-violet bg-violet">
    <div class="container-fluid">
      <div class="navbar-header">
        <span class="network"
              :class="{enable: isConnected, disable: !isConnected}"></span>
        <router-link tag="a"
                     :to="{name: 'home'}"
                     class="navbar-brand text-lightviolet">
          ZilPay
        </router-link>
      </div>

      <Dropdown v-if="isEnable"
                :options="options"
                :selected="selectednet"
                :anException="networkSettings"
                :classBtn="'dark text-pink'"
                @updateOption="selectDefaultNet"/>

      <ul class="nav navbar-nav navbar-right">
        <li v-show="isEnable">
          <div id="jazzicon"
               @click="jazziconRoute"/>
        </li>

        <img v-if="!isExpand"
             class="expand-view"
             src="/img/expand.svg"
             @click="onExpand">
      </ul>
    </div>
  </nav>
</template>

<script>
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex'
import Dropdown from './Dropdown'


export default {
  name: 'NavBar',
  components: { Dropdown },
  data() {
    return {
      networkSettings: 'Settings'
    };
  },
  computed: {
    ...mapGetters(['isExpand']),
    ...mapState('storage', [
      'config',
      'selectednet',
      'isEnable',
      'isConnected'
    ]),

    options() {
      return Object.keys(this.config).concat(
        [this.networkSettings]
      );
    }
  },
  methods: {
    ...mapMutations(['spiner']),
    ...mapActions(['onExpand']),
    ...mapActions('storage', [
      'balanceUpdate',
      'updateNode'
    ]),

    async selectDefaultNet(value) {
      if (!value) {
        return null;
      }

      if (value == this.networkSettings) {
        this.$router.push({ name: 'net' });
        return null;
      }

      this.spiner();

      await this.updateNode(value);
      await this.balanceUpdate();

      this.spiner();
    },
    jazziconRoute() {
      const current = this.$router.history.current.name;
      const settings = this.$router.options.routes[3].name;

      if (current == settings) {
        this.$router.go(-1);
      } else {
        this.$router.push({ name: settings });
      }      
    }
  },
  mounted() { }
}
</script>

<style lang="scss">
@import '../../styles/colors';

#jazzicon, .to-back { cursor: pointer; }

.network {
    content: "";
    width: 8px;
    height: 8px;
    display: inline-block;
    vertical-align: middle;
    
    border-radius: 50%;
    margin-right: 6px;
}
.enable {
  background-color: $teal;
}
.disable {
  background-color: $red;
}
</style>
