<template>
  <div>
    <BackBar/>

    <main class="is-mini import-page">
      <h2 class="text-center">
        You can import account by private key or hardware wallet
      </h2>

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
        <span>Connect a hardware wallet</span>

        <div class="type-select">
          <button class="form-border" @click="hardWareType = 'ledger'">
            <img src="/icons/ledger-logo.svg" height="20">
          </button>
          <button class="form-border" @click="hardWareType = 'trezor'">
            <img src="/icons/trezor-logo.svg" height="20">
          </button>
        </div>

        <div class="coming-soon" v-if="hardWareType == 'trezor'">
          <h1>Coming soon</h1>
        </div>

        <div class="form-border ledger-form" v-if="hardWareType == 'ledger'">
          <div class="input-form">
            <input type="number" v-model="ladgerIndex">
            <button @click="ledgerGetAddress">connect</button>
          </div>
          <small class="text-danger">{{ledgerErr}}</small>
        </div>
      </div>

    </main>
  </div>
</template>

<script>
import { fromBech32Address } from '@zilliqa-js/crypto'
import { mapActions, mapMutations } from 'vuex'
import LedgerControll from '../../lib/hardware/ledger'

const BackBar = () => import('../components/BackBar');


const ledgerControll = new LedgerControll();

export default {
  name: 'Import',
  components: { BackBar },
  data() {
    return {
      type: null,
      hardWareType: null,

      privKey: null, privKeyErrMsg: null,

      ledgerErr: null,
      ladgerIndex: 0
    };
  },
  methods: {
    ...mapMutations(['spiner']),
    ...mapActions('Wallet', [
      'importByPrivateKey',
      'importByHw'
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
    },
    async ledgerGetAddress() {
      this.spiner();
      const hwIndex = this.ladgerIndex;
      const hwType = 'ledger';

      try {
        if (isNaN(hwIndex)) {
          throw new Error('index must be number');
        }
        let { pubAddr } = await ledgerControll.getAddresses(
          hwIndex
        );

        pubAddr = fromBech32Address(pubAddr);
        await this.importByHw({ pubAddr, hwIndex, hwType });
        this.spiner();
        this.$router.push({ name: 'Home' });
        return null;
      } catch(err) {
        this.ledgerErr = err.message;
      }
      this.spiner();
    }
  }
}
</script>

<style lang="scss">
.import-page {
  font-size: 15px;
  font-weight: 600;
}
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
  grid-template-columns: 1fr 1fr;
  grid-gap: 10px;
  
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
.by-hardware {
  width: 80%;
  justify-self: center;

  .type-select {
    margin-top: 40px;
  }
}
.ledger-form {
  padding: 20px;
  margin-top: 50px;
  
  div.input-form {
    display: grid;
    grid-template-columns: 2fr 1fr;
    grid-gap: 30px;
  }
}
</style>
