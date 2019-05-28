<template>
  <div>
    <BackBar/>

    <main class="create-acc">
      <label>Your mnemonic Seed Phrase.
        <img src="/icons/refresh.svg" height="15"
             class="update-seed"
             @click="randomMnemonic">
      </label>
      <textarea class="mnemonic" disabled
                cols="30" v-model="seed"></textarea>
      <small class="text-danger">{{seedErr}}</small>
      <button @click="printSeed">Print</button>

      <div class="text-center text-primary">
        Save your mnemonic Seed Phrase!
      </div>

      <div class="input-group">
         <div class="text-left">
          <label>Password (min 6 chars)</label>
          <input type="password" v-model.lazy="password">
          <small v-show="isValidPassword"
                 class="text-danger">{{isValidPassword}}</small>
        </div>
        <div class="text-left">
          <label>Confirm Password</label>
          <input type="password" v-model="confirmPassword">
          <small v-show="isConfirmPassword"
                 class="text-danger">{{isConfirmPassword}}</small>
        </div>

        <button :disabled="isContinue" @click="createWallet">
          continue
        </button>
      </div>
    </main>
  </div>
</template>

<script>
import { mapActions, mapMutations } from 'vuex'
import PasswordValidator from '../mixins/password-validator'

const BackBar = () => import('../components/BackBar');


// this method was copied from zillet wallet "https://zillet.io";
const printMnemonic = phrase => {
  return `<html id="print-wallet">
  <link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,600,700" rel="stylesheet">
  <div class="print-container" style="margin-bottom: 50px;" id="print-container" onload="myFunction()">
      <div class="print-text">
          <p>
          Please
          <strong>DO NOT FORGET</strong> to save your mnemonic Seed Phrase. You will need your
          <strong>Mnemonic Seed Phrase</strong> to restore your wallet.
          </p>
          <h3 style="letter-spacing: 0.02rem;"> Your Mnemonic seed</h3>
          <div class="phrase">
            ${phrase}
          </div>
          <p>
              <b>Do not lose it!</b> It cannot be recovered if you lose it.
          </p>
          <p>
            <b>Do not share it!</b> Your funds will be stolen if you use this file on a phishing site.
          </p>
          <p>
            <b>Make a backup!</b> Secure it like the millions of dollars it may one day be worth.
          </p>
          <div class="footer">
            <a href="https://zilpay.xyz/">ZilPay</a href="">
          </div>
      </div>
  </div>
  <style>
  pre{
      margin: 0 auto 0;
      text-align:center;
  }
  .print-container {
    text-align: center;
      font-family: 'Source Sans Pro', sans-serif;
      -webkit-font-smoothing: antialiased;
      width: 900px;
      border: 1px solid gray;
      display: flex;
      margin-bottom: 50px;
      position: relative;
      color: #2d3748;
  }
  .hidden{
      visiblity:hidden;
      height: 0;
      width:0;
      margin:0;
  }
  .print-text{
      width: 100%;
      margin: auto;
      position: relative;
      padding: 20px;
      overflow: hidden;
  }
  p, strong{
      word-break: break-word;
  }
  img{
      max-width: 150px;
  }
  .phrase{
    font-family: Menlo,Monaco,Consolas,Courier New,monospace!important;
    font-weight: 500!important;
    flex: 1 1 0%;
    max-width: 500px;
    margin: auto;
    position: relative;
    padding: .75rem 1rem;
    margin-bottom: 2rem;
    border-radius: .25rem;
    border:  1px solid gray;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    line-height: 1.5;
  }
  a{
    color: rgba(#2d3748, 0.3);
    font-size: 0.8rem;
    text-decoration: none;
    text-align: center;
  }
  </style>
<html>
`;
};

export default {
  name: 'CreateAcc',
  components: { BackBar },
  mixins: [PasswordValidator],
  data() {
    return {      
      seed: null, seedErr: null
    };
  },
  methods: {
    ...mapMutations(['spiner']),
    ...mapMutations('Wallet', [
      'mutateIsReady',
      'mutateIsEnable'
    ]),
    ...mapActions('Wallet', [
      'randomSeed',
      'newWallet'
    ]),

    printSeed() {
      const paperWallet = printMnemonic(this.seed);
      let paperBody = document.createElement('BODY');
      paperBody.innerHTML = paperWallet;
      var win = window.open('about:blank', '_blank');
      this.isKeyDownloaded = true;
      win.document.body = paperBody;
      setTimeout(() => {
        win.print();
      }, 500);
    },
    async randomMnemonic() {
      const { resolve } = await this.randomSeed();
      this.seed = resolve;
    },
    async createWallet() {
      this.spiner();

      try {
        await this.newWallet({
          seed: this.seed,
          password: this.password
        });
        this.mutateIsReady(true);
        this.mutateIsEnable(true);
        this.spiner();
        this.$router.push({ name: 'Home' });
      } catch(err) {
        this.seedErr = err.message;
        this.spiner();
      }
    }
  },
  mounted() {
    this.randomMnemonic();
  }
}
</script>

<style lang="scss">
.mnemonic {
  margin: 0px; height: 157px; width: 332px;
}
.update-seed {
  cursor: pointer;
}
.create-acc {
  justify-content: center;
  justify-items: center;
}
</style>
