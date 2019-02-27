<template>
  <div class="container">
    <div class="row justify-content-center pt-3">
      <div class="col-lg-12 text-center text-ightindigo pt-3">
        <h3 class="text-pink text-left point"
            @click="$router.go(-1)">&#60;back</h3>
        <h3>Enter your secret twelve word
           phrase here to restore your vault.</h3>
        <h1></h1>
      </div>

      <div class="form-group p-5">
        <label for="seed">Wallet Seed</label>
        <textarea class="form-control bg-null"
                  id="seed"
                  v-model.lazy="phrase">
        </textarea>

        <div class="pt-5">
          <label for="pass">Password</label>
          <input type="password"
                class="form-control bg-null text-pink"
                id="pass"
                placeholder="Password"
                v-model.lazy="pass"
                :class="{involid:isValid}">
        </div>

        <button v-btn="'info btn-lg btn-block mt-4'"
                @click="submit">
          CREATE
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import btn from '../directives/btn'
import Mnemonic from '../lib/mnemonic'
import Crypto from '../lib/crypto'
import chromep from 'chrome-promise'


export default {
  name: 'Create',
  directives: { btn },
  data() {
    return {
      mnemonic: new Mnemonic(),
      crypto: new Crypto(),
      pass: '',
      isValid: false,
      phrase: ''
    };
  },
  mounted() {
    this.phrase = this.mnemonic.generateMnemonic();
  },
  methods: {
    async submit() {
      if (this.pass.length < 3) {
        this.isValid = true;
      } else {
        this.isValid = false;
        return null;
      }

      let wallet = await this.onEncrypt();
      await chromep.storage.local.set(wallet);
    },
    async onEncrypt() {
      let wallet = await this.mnemonic.getAccountAtIndex(this.phrase);
      let walletHash = await this.crypto.encrypt(wallet, this.pass);
      let seedHash = await this.crypto.encrypt(this.phrase, this.pass);

      return { privKeys: [walletHash], seedHash };
    }
  }
}
</script>

<style lang="scss">
#seed {
  height: 150px;
  width: 250px;
}
</style>
