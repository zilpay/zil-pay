<template>
  <nav class="navbar navbar-inverse navbar-violet bg-violet">
    <div class="container-fluid">
      <div class="navbar-header">
        <a class="navbar-brand text-lightviolet"
           href="#">ZilPay</a>
      </div>

      <Dropdown v-if="isEnable"
                :options="options"
                :selected="selectedNet"
                :classBtn="'dark text-pink'"
                @updateOption="selectDefaultNet"/>

      <ul class="nav navbar-nav navbar-right">
        <li v-show="isEnable">
          <router-link :to="$router.options.routes[3].path">
            <div id="jazzicon"/>
          </router-link>
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
      'selectedNet',
      'isEnable'
    ]),

    options() {
      return Object.keys(this.config);
    }
  },
  methods: {
    ...mapMutations(['spiner']),
    ...mapMutations('storage', [
      'setNet'
    ]),
    ...mapActions('storage', [
      'balanceUpdate'
    ]),

    async selectDefaultNet(value) {
      if (!value) {
        return null;
      }

      this.spiner();

      try {
        this.setNet(value);
        await this.balanceUpdate();
      } catch(err) {
        console.error(err);
      }

      this.spiner();
    }
  },
  mounted() { }
}
</script>

<style lang="scss">
#jazzicon, .to-back { cursor: pointer; }
</style>
