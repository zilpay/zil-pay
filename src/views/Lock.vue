<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-lg-12 text-center text-ightindigo">
        <h1 class="display-3">ZilPay</h1>
        <h1 class="display-4">Welcome Back!</h1>
      </div>

      <div class="form-group pt-2">
        <label for="pass">Password</label>
        <input type="password"
               class="form-control bg-null text-pink"
               id="pass"
               placeholder="Password"
               v-model="password"
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
import { mapActions } from 'vuex'
import btn from '../directives/btn'
import StorageMixin from '../mixins/storage'
import CryptoMixin from '../mixins/crypto'


export default {
  name: 'LockPage',
  mixins: [StorageMixin, CryptoMixin],
  directives: { btn },
  data() {
    return {
      password: '',
      wrongPassword: false,
      storeKey: 'PASSWORD'
    };
  },
  methods: {
    ...mapActions('storage', [
      'updateJWT'
    ]),
    async encryptingAccaunt() {
      let status = await this.updateJWT(this.password);

      if (status) {
        this.$router.push({ name: 'home' });
      }

      this.wrongPassword = !status;
    }
  }
}
</script>

<style lang="scss">
// @import '../styles/colors';
</style>
