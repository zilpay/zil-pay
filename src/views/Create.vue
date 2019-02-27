<template>
  <div class="container">
    <div class="row justify-content-center pt-3">
      <div class="col-lg-12 text-center text-ightindigo pt-3">
        <h3>Enter your secret twelve word
           phrase here to restore your vault.</h3>
        <h1></h1>
      </div>

      <div class="form-group p-5">
        <label for="seed">Wallet Seed</label>
        <textarea class="form-control bg-null"
                  id="seed"
                  v-model="phrase">
        </textarea>

        <Dropdown class="pt-2"
                  :options="options"
                  :selected="options[1]"
                  :classBtn="'dark text-pink'"
                  @updateOption="updateOption"/>

        <div class="pt-5">
          <label for="pass">New Password</label>
          <input type="password"
                class="form-control bg-null text-pink"
                id="pass"
                placeholder="New Password"
                v-model.lazy="pass"
                :class="{involid:isValid}">

          <label for="cpass">Confirm Password</label>
          <input type="password"
                class="form-control bg-null text-pink"
                id="cpass"
                placeholder="Confirm Password"
                v-model.lazy="cpass"
                :class="{involid:isValid}">
        </div>

        <button v-btn="'info btn-lg btn-block mt-4'"
                :disabled="btnDisabled">
          RESTORE
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Mnemonic from 'bitcore-mnemonic'
import Dropdown from '../components/UI/Dropdown'
import btn from '../directives/btn'


export default {
  name: 'Create',
  components: { Dropdown },
  directives: { btn },
  data() {
    return {
      pass: '',
      cpass: '',
      btnDisabled: true,
      isValid: false,
      selected: 'ENGLISH',
      phrase: ''
    };
  },
  computed: {
    options() {
      return Object.keys(Mnemonic.Words);
    }
  },
  mounted() {
    this.mnemonicString();
  },
  methods: {
    updateOption(selected) {
      this.selected = selected;
      this.mnemonicString();
    },
    mnemonicString() {
      let code = new Mnemonic(Mnemonic.Words[this.selected]);
      this.phrase = code.toString();
      let xpriv = code.toHDPrivateKey();
      console.log(xpriv);
    }
  }
}
</script>

<style lang="scss">
#seed {
  height: 200px;
  width: 250px;
}
</style>
