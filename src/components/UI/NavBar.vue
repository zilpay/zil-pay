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

      <b-dropdown v-if="isEnable"
                  :text="selectednet"
                  variant="primary"
                  class="mr-4">
        <b-dropdown-item v-for="option of options"
                         :key="option"
                         :active="option == selectednet"
                         @click="selectDefaultNet(option)">
          {{option}}
        </b-dropdown-item>
        <b-dropdown-item @click="$router.push({ name: 'net' })">
          {{networkSettings}}
        </b-dropdown-item>
      </b-dropdown>

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


export default {
  name: 'NavBar',
  components: {  },
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
      return Object.keys(this.config);
    }
  },
  methods: {
    ...mapMutations(['spiner']),
    ...mapActions(['onExpand']),
    ...mapActions('storage', [
      'balanceUpdate',
      'changeNetwork'
    ]),

    async selectDefaultNet(value) {
      if (!value) {
        return null;
      }

      this.spiner();

      try {
        await this.changeNetwork(value);
        await this.balanceUpdate();
      } catch(err) {
        console.log('navbar.balanceUpdate', err.message);
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
.dropdown-menu {
  top: 15px !important;
}
.dropdown-toggle {
  color: $ightindigo;
}
.btn-primary:hover {
  color: $ightindigo !important;
}
</style>
