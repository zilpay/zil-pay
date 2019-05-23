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
             placeholder="Password"
             v-model="password">   
      <br>          
      <div class="warn text-danger" v-show="wrong">Wrong password</div>
      <button @click="auth">Continue</button>
      <hr>
    </div>

  </main>
</template>

<script>
export default {
  name: 'LockScreen',
  data() {
    return {
      password: '',
      wrong: false
    };
  },
  methods: {
    auth() {
      if (this.password == '123') {
        this.$router.push({ name: 'Home' });
      }
    }
  }
}
</script>

<style lang="scss">
.lock {
  padding-top: 100px;
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
    margin-top: 50px;
  }
}
</style>
