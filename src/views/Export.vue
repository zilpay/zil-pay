<template>
  <div>
    <BackBar/>

    <main class="export">
      <div class="header" v-show="textarea">
        <label>{{label}}</label>
        <br>
        <textarea class="seed" cols="30"></textarea>
      </div>

      <div class="input-group" v-show="!textarea">
         <div class="text-left">
          <label>Password</label>
          <input type="password" autofocus>
        </div>
        <button>Export</button>
      </div>
    </main>
  </div>
</template>

<script>
const BackBar = () => import('../components/BackBar');

export default {
  name: 'Export',
  components: { BackBar },
  data() {
    return {
      textarea: null
    };
  },
  computed: {
    label() {
      const type = this.$router.currentRoute.params.type;

      if (type == 'key') {
        return 'Your PrivateKey.';
      }
      if (type == 'seed') {
        return 'Your mnemonic word phrase.';
      }
      return null;
    }
  }
}
</script>

<style lang="scss">
.export {
  justify-items: center;

  & > .input-group > button {
    margin-top: 40px;
    width: 100%;
  }
}
</style>