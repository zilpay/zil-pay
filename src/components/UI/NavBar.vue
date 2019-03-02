<template>
  <nav class="navbar navbar-inverse navbar-violet bg-violet">
    <div class="container-fluid">
      <div class="navbar-header">
        <a class="navbar-brand text-lightviolet"
           href="#">ZilPay</a>
      </div>

      <Dropdown :options="options"
                :selected="options[0]"
                :classBtn="'dark text-pink'"/>

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
import { mapActions} from 'vuex'
import Dropdown from './Dropdown'


export default {
  name: 'NavBar',
  components: { Dropdown },
  mounted() {
    this.jazzicon('jazzicon');
  },
  computed: {
    options() {
      return ['mainnet', 'testnet'];
    }
  },
  methods: {
    ...mapActions('storage', [
      'jazzicon'
    ]),
  }
}
</script>

<style lang="scss">
#jazzicon, .to-back { cursor: pointer; }
</style>
