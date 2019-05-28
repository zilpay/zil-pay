<template>
  <div>
    <BackBar/>

    <main class="restore is-mini">
      <div>
        <h5>Restore by mnemonic Seed Phrase</h5>
        <label>Enter your secret mnemonic word phrase here.</label>
        <br>
        <textarea class="seed"
                  placeholder="Separate each word with a single space"
                  cols="30"
                  v-model="seed"></textarea>
        <br>
        <small v-show="isMnemonic" class="text-danger">{{isMnemonic}}</small>
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
import { validateMnemonic } from 'bip39'
import PasswordValidator from '../mixins/password-validator'
import AccountCreater from '../mixins/account-creater'

const BackBar = () => import('../components/BackBar');


export default {
  name: 'Restore',
  components: { BackBar },
  mixins: [PasswordValidator, AccountCreater],
  computed: {
    isMnemonic() {
      const isSeed = validateMnemonic(this.seed);
      if (this.seed === null) {
        return '';
      } else if (isSeed) {
        /* eslint-disable */
        this.isKeyDownloaded = true;
        return false;
      } else {
        /* eslint-disable */
        this.isKeyDownloaded = false;
        return 'Wrong mnemonic Seed Phrase';
      }
    }
  }
}
</script>

<style lang="scss">
.seed {
  justify-self: center;
}
.input-group > button {
  margin-top: 30px;
  width: 100%;
}
.restore {
  justify-content: center;
  justify-items: center;
}

</style>
