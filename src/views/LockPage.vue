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
               v-model.lazy="pass"
               :class="{involid:isValid}">
        
        <button v-btn="'info btn-lg btn-block mt-4'"
                @click="encrypting">
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
import btn from '../directives/btn'


export default {
  name: 'LockPage',
  directives: { btn },
  data() {
    return {
      pass: '',
      isValid: false
    };
  },
  methods: {
    encrypting() {
      if (this.pass == '123') {
        let homePage = this.$router.options.routes[2].path;
        this.$router.replace(homePage);
      } else {
        this.isValid = !this.isValid;
      }
    }
  }
}
</script>

<style lang="scss">
@import '../styles/colors';

.involid {
  border-color: $red;
}
</style>
