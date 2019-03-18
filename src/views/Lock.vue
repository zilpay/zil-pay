<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-lg-12 text-center text-ightindigo">
        <h1 class="display-3">ZilPay</h1>
        <h5>Welcome Back!</h5>
      </div>

      <div class="form-group pt-2" style="margin-top: 20%;">
        <label for="pass">Password</label>
        <input type="password"
               class="form-control bg-null text-pink"
               id="pass"
               autofocus
               placeholder="Password"
               v-model="password"
               @change="encryptingAccaunt"
               @input="wrongPassword = false">
        <div class="error text-danger" v-if="wrongPassword">
          Incorrect password
        </div>
        
        <button v-btn="'info btn-lg btn-block mt-4'"
                :disabled="!password"
                @click="encryptingAccaunt">
          SIGN IN
        </button>
        
        <router-link :to="$router.options.routes[1].path">
          <p class="text-center text-ightindigo p-2">Restore account</p>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import btn from '../directives/btn'


export default {
  name: 'LockPage',
  directives: { btn },
  data() {
    return {
      password: '',
      wrongPassword: false,
      storeKey: 'PASSWORD'
    };
  },
  computed: {
    ...mapState('storage', [
      'confirmationTx'
    ]),
  },
  methods: {
    ...mapActions('storage', [
      'unLock'
    ]),
    
    async encryptingAccaunt() {
      const status = await this.unLock(this.password);
      this.wrongPassword = !status;

      if (!this.wrongPassword) {
        if (this.confirmationTx.length > 0) {
          this.$router.push({ name: 'confirmation' });
          return null;
        } else if (window.data) {
          this.$router.push({ name: 'confirmation' });
          return null;
        }
        this.$router.push({ name: 'home' });
      }
    }
  }
}
</script>

<style lang="scss">
// @import '../styles/colors';
</style>
