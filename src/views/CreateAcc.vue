<template>
  <div>
    <BackBar/>

    <main class="animated fadeIn faster create-acc is-mini">
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
import PasswordValidator from '../mixins/password-validator'
import AccountCreater from '../mixins/account-creater'

const BackBar = () => import('../components/BackBar');


export default {
  name: 'CreateAcc',
  components: { BackBar },
  mixins: [PasswordValidator, AccountCreater],
  mounted() {
    this.randomMnemonic();
    this.isKeyDownloaded = true;
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
