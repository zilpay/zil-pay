<template>
  <div class="container">
    <div class="row justify-content-center pt-3">
      <div class="col-lg-12 text-center text-ightindigo pt-3">
        <router-link :to="$router.options.routes[0].path">
          <h3 class="text-warning text-left point">&#60;back</h3>
        </router-link>
        <h3>Enter your secret twelve word
           phrase here to restore your vault.</h3>
        <h1></h1>
      </div>

      <div class="form-group p-5">
        <label for="seed">Wallet Seed</label>
        <textarea class="form-control bg-null"
                  id="seed"
                  v-model="mnemonicPhrase">
        </textarea>
        <div class="error text-danger" v-if="$v.mnemonicPhrase.sameAs">
          Seed phrases is wrong.
        </div>

        <div class="pt-3">
          <label for="pass">Password</label>
          <input type="password"
                 class="form-control bg-null text-pink"
                 id="pass"
                 placeholder="Password"
                 v-model="password">
          <div class="error text-danger" v-if="!$v.password.minLength">
            Password must have at least 
            {{$v.password.$params.minLength.min}} letters.
          </div>
        </div>

        <div class="pt-3">
          <label for="confirm">Confirm Password</label>
          <input type="password"
                 class="form-control bg-null text-pink"
                 id="confirm"
                 placeholder="Confirm Password"
                 v-model="confirm">
          <div class="error text-danger" v-if="!$v.confirm.sameAs">
            Passwords Don't Match
          </div>
        </div>

        <button v-btn="'info btn-lg btn-block mt-4'"
                :disabled="$v.submitForm.sameAs"
                @click="submit">
          CREATE
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'
import btn from '../directives/btn'
import MnemonicMixin from '../mixins/mnemonic'
import StorageMixin from '../mixins/storage'
import { validationMixin } from 'vuelidate'
import { required, minLength, sameAs } from 'vuelidate/lib/validators'


export default {
  name: 'Create',
  mixins: [MnemonicMixin, StorageMixin, validationMixin],
  directives: { btn },
  data() {
    return {
      mnemonicPhrase: '',
      password: '',
      confirm: '',
      submitForm: true
    };
  },
  validations: {
    password: {
      required,
      minLength: minLength(6)
    },
    confirm: {
      required,
      sameAs: sameAs('password')
    },
    mnemonicPhrase: {
      sameAs: sameAs(vue => {
        return vue.mnemonic.validateMnemonic(vue.phrase);
      })
    },
    submitForm: {
      sameAs: sameAs(vue => {
        if (!vue.password || !vue.confirm || !vue.mnemonicPhrase) {
          return true;
        }
        return !vue.$v.confirm.sameAs || !vue.$v.password.minLength;
      })
    }
  },
  mounted() {
    this.mnemonicPhrase = this.mnemonic.generateMnemonic();
  },
  methods: {
    ...mapMutations('wallet', [
      'addAddress',
      'selectAddress'
    ]),
    async submit() {
      let wallet = await this.onEncrypt(this.phrase, this.password);
      
      await this.set(wallet);
      
      wallet.wallets.forEach(el => {
        this.set({ selectAddress: el });
        this.addAddress(el);
        this.selectAddress(el.address);
      });
      
      this.$router.push({ name: 'home' });
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
