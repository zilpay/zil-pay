<template>
  <nav class="navbar navbar-inverse navbar-violet bg-violet">
    <div class="container-fluid">
      <div class="navbar-header">
        <a class="navbar-brand text-lightviolet"
           href="#">ZilPay</a>
      </div>

      <Dropdown v-if="selectedNet"
                :options="options"
                :selected="selectedNet"
                :classBtn="'dark text-pink'"
                @updateOption="selectNet"/>

      <ul class="nav navbar-nav navbar-right">
        <li>
          <router-link :to="$router.options.routes[3].path">
            <div id="jazzicon"/>
          </router-link>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex'
import Dropdown from './Dropdown'


export default {
  name: 'NavBar',
  components: { Dropdown },
  mounted() {
    this.jazzicon('jazzicon');
  },
  computed: {
    ...mapState('storage', [
      'config',
      'selectedNet'
    ]),

    options() {
      return Object.keys(this.config);
    }
  },
  methods: {
    ...mapActions('storage', [
      'jazzicon'
    ]),
    ...mapMutations('storage', [
      'setNet'
    ]),
    ...mapActions('zilliqa', [
      'balanceUpdate'
    ]),
    ...mapMutations('zilliqa', [
      'changeProvider'
    ]),

    async selectNet(net) {
      await this.setNet(net);
      await this.changeProvider(net);
      await this.balanceUpdate();
    }
  }
}
</script>

<style lang="scss">
#jazzicon, .to-back { cursor: pointer; }
</style>
