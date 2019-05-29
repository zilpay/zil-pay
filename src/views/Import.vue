<template>
  <div>
    <BackBar/>

    <main class="is-mini">
      <h5 class="text-center">
        You can import account by private key or hardware wallet
      </h5>

      <div class="option">
        <button @click="type = 'key'">private key</button>
        <button @click="type = 'hardware'">hardware</button>
      </div>
      

      <div v-if="type == 'key'" class="by-key">
        <label>Pass your private key.</label>
        <textarea class="private-key"
                  cols="30"
                  v-model="privKey"
                  @input="privKeyErrMsg = null"></textarea>
        <small class="text-danger">
          {{privKeyErrMsg}}
        </small>
        <button @click="importThis">import account</button>
      </div>

      <div v-if="type == 'hardware'" class="by-hardware text-center">
        <h5>Connect a hardware wallet</h5>
        <label>Select a hardware wallet to use with ZilPay</label>

        <div class="type-select">
          <button class="form-border" @click="hardWareType = 'ledger'">
            <img src="/icons/ledger-logo.svg" height="30">
          </button>
          <button class="form-border" @click="hardWareType = 'trezor'">
            <img src="/icons/trezor-logo.svg" height="30">
          </button>
        </div>

        <div class="coming-soon" v-if="hardWareType">
          <h1>coming soon</h1>
        </div>
        <button v-if="hardWareType" disabled>continue</button>
      </div>

    </main>
  </div>
</template>

<script>
import { mapActions, mapMutations } from 'vuex'

const BackBar = () => import('../components/BackBar');


export default {
  name: 'Import',
  components: { BackBar },
  data() {
    return {
      type: null,
      hardWareType: null,

      privKey: null, privKeyErrMsg: null,
    };
  },
  methods: {
    ...mapMutations(['spiner']),
    ...mapActions('Wallet', [
      'importByPrivateKey'
    ]),

    async importThis() {
      this.spiner();
      try {
        await this.importByPrivateKey(this.privKey);
      } catch(err) {
        this.privKeyErrMsg = err.message;
      }
      this.spiner();
      if (!this.privKeyErrMsg) {
        this.$router.push({ name: 'Home' });
      }
    }
  }
}
</script>

<style lang="scss">
.option {
  justify-self: center;

  button {
    margin: 10px;
  }
}
.private-key {
  margin: 0px; width: 304px; height: 164px;
}
.by-key {
  display: grid;
  grid-template-columns: 1fr;
  justify-items: center;

  button {
    margin: 10px;
  }
}
.type-select {
  display: grid;
  grid-template-columns: 50% 50%;
  grid-gap: 10px;
  justify-content: center;
  justify-items: center;
  
  button {
    display: grid;
    justify-content: center;
    justify-items: center;
    height: 60px;
    background-color: transparent;

    &:focus {
      outline: -webkit-focus-ring-color auto 5px;
    }
  }
}
</style>
