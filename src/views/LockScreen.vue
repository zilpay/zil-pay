<template>
  <main class="lock text-center">
    
    <div class="animated fadeIn faster">
      <img src="/icon128.png">
      <h1>ZilPay</h1>
      <span>Welcome back</span>
    </div>

    <form class="password-form"
          @submit.prevent="unlock">
      <input class="text-center"
             type="password"
             autofocus
             placeholder="Password"
             @input="wrong = false"
             v-model="password">
      <br>
      <div class="warn text-danger" v-show="wrong">Wrong password</div>
      <input class="btn" type="submit" value="Continue"
             @submit.prevent="unlock">
    </form>

  </main>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  name: 'LockScreen',
  data() {
    return {
      password: '',
      wrong: false
    };
  },
  computed: {
    ...mapState('Transactions', [
      'confirmationTx'
    ]),
    ...mapState('Static', [
      'connect'
    ])
  },
  methods: {
    ...mapActions('Wallet', [
      'unlockWallet'
    ]),

    async unlock() {
      try {
        await this.unlockWallet(this.password);

        if (this.confirmationTx && this.confirmationTx.length > 0) {
          this.$router.push({ name: 'Popup' });
        } else if (this.connect && Object.keys(this.connect).length > 0) {
          this.$router.push({ name: 'Connect' });
        } else {
          this.$router.push({ name: 'Home' });
        }
      } catch(err) {
        this.wrong = true;
      }
    }
  }
}
</script>

<style lang="scss">
.lock {
  padding-top: 20px;
}
.warn {
  text-align: left;
  font-size: 13px;
  font-weight: 400;
}
.password-form {
  input {
    width: 300px;
  }
  button {
    margin-top: 30px;
  }
}
</style>
