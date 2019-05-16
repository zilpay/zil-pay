<template>
  <main class="lock text-center">
    
    <div>
      <img src="/icon128.png">
      <h1>ZilPay</h1>
      <span>Welcom back</span>
    </div>

    <div>
      <input class="text-center"
             type="text"
             placeholder="Password"
             v-model="password">
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
      password: ''
    };
  },
  methods: {
    auth() {
      if (this.password == '123') {
        this.$router.push({ name: 'home' });
      }
    }
  }
}
</script>

<style lang="scss">
.lock {
  padding-top: 100px;
}
</style>
