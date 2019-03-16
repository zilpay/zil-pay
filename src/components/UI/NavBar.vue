<template>
  <nav class="navbar navbar-inverse navbar-violet bg-violet">
    <div class="container-fluid">
      <div class="navbar-header">
        <router-link tag="a"
                     :to="{name: 'home'}"
                     class="navbar-brand text-lightviolet">
          ZilPay
        </router-link>
      </div>

      <Dropdown v-if="isEnable"
                :options="options"
                :selected="selectednet"
                :classBtn="'dark text-pink'"
                @updateOption="selectDefaultNet"/>

      <ul class="nav navbar-nav navbar-right">
        <li v-show="isEnable">
          <div id="jazzicon"
               @click="jazziconRoute"/>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import Dropdown from './Dropdown'


export default {
  name: 'NavBar',
  components: { Dropdown },
  computed: {
    ...mapState('storage', [
      'config',
      'selectednet',
      'isEnable'
    ]),

    options() {
      return Object.keys(this.config);
    }
  },
  methods: {
    ...mapMutations(['spiner']),
    ...mapActions('storage', [
      'balanceUpdate',
      'updateNode'
    ]),

    async selectDefaultNet(value) {
      if (!value) {
        return null;
      }

      this.spiner();

      try {
        await this.updateNode(value);
        await this.balanceUpdate();
      } catch(err) {
        console.error(err);
      }

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
#jazzicon, .to-back { cursor: pointer; }
</style>
