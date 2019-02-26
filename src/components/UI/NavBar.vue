<template>
  <nav class="navbar navbar-inverse navbar-violet bg-violet">
    <div class="container-fluid">
      <div class="navbar-header">
        <a class="navbar-brand text-lightviolet"
           href="#">ZilPay</a>
      </div>

      <Dropdown :options="options"
                :selected="options[0]"
                :classBtn="'lightviolet text-pink'"/>

      <ul class="nav navbar-nav navbar-right">
        <li>
          <router-link :to="$router.options.routes[1].path">
            <div id="jazzicon"/>
          </router-link>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script>
import Dropdown from './Dropdown'
import jazzicon from 'jazzicon'


export default {
  name: 'NavBar',
  components: { Dropdown },
  mounted() {
    this.onJazzicon();
  },
  computed: {
    options() {
      return ['mainnet', 'testnet'];
    }
  },
  methods: {
    onJazzicon() {
      let ctx = window.document.querySelector('#jazzicon');
      let el = jazzicon(45, Math.round(Math.random() * 10000000));
      ctx.appendChild(el);
    }
  }
}
</script>

<style lang="scss">
#jazzicon, .to-back { cursor: pointer; }
</style>
