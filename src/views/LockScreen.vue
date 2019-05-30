<template>
  <main class="lock text-center">
    
    <div>
      <img src="/icon128.png">
      <h1>ZilPay</h1>
      <span>Welcom back</span>
    </div>

    <div class="password-form">
      <input class="text-center"
             type="password"
             autofocus
             placeholder="Password"
             @input="wrong = false"
             v-model="password"
             @blur="unlock">
      <br>          
      <div class="warn text-danger" v-show="wrong">Wrong password</div>
      <button @click="unlock">Continue</button>
    </div>

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
