<template>
  <div class="container">
    <div class="row justify-content-center pt-3">
      <div v-if="pubKeyJWT" class="col-lg-12 text-center text-ightindigo pt-3">
        <router-link :to="$router.options.routes[0].path">
          <h3 class="text-warning text-left point">&#60;back</h3>
        </router-link>
        <h3>Enter your secret twelve word
           phrase here to restore your vault.</h3>
      </div>

      <div class="form-group p-5">
        <label for="seed">Wallet Seed</label>
        <textarea class="form-control bg-null"
                  id="seed"
                  v-model="mnemonicPhrase">
        </textarea>
        <div class="error text-danger">
          <div v-if="$v.mnemonicPhrase.sameAs">
            Seed phrases is wrong.
          </div>
          <div v-if="!$v.mnemonicPhrase.minLength">
            Seed phrases are
            {{$v.mnemonicPhrase.$params.minLength.min}}
            words long
          </div>
        </div>

        <div class="pt-3">
          <label for="pass">Password</label>
          <input type="password"
                 class="form-control bg-null text-pink"
                 id="pass"
                 placeholder="Password"
                 v-model="password">
          <div class="error text-danger"
               v-if="!$v.password.minLength">
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
import { validationMixin } from 'vuelidate'
import { required, minLength, sameAs } from 'vuelidate/lib/validators'
import { mapMutations, mapActions, mapState } from 'vuex'
import btn from '../directives/btn'
import MnemonicMixin from '../mixins/mnemonic'


export default {
  name: 'Create',
  mixins: [MnemonicMixin, validationMixin],
  directives: { btn },
  data() {
    return {
      mnemonicPhrase: '',
      password: '',
      confirm: '',
      submitForm: true
    };
  },
  computed: {
    ...mapState('storage', [
      'pubKeyJWT'
    ])
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
      minLength: minLength(12),
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
  methods: {
    ...mapMutations([
      'spiner'
    ]),
    ...mapActions('storage', [
      'syncBrowser',
      'bip39Encrypt',
      'createJWT',
      'jazzicon'
    ]),
    ...mapActions('zilliqa', [
      'createWallet'
    ]),
    ...mapMutations('storage', ['bip39']),

    async submit() {
      this.spiner();
      this.mnemonic.bip32Node(this.mnemonicPhrase);

      await this.createJWT(this.password);
      await this.bip39Encrypt(this.mnemonic.phrase);
      await this.createWallet(0);
      await this.jazzicon('jazzicon');

      this.spiner();
      this.$router.push({ name: 'home' });
    }
  },
  mounted() {
    console.log(this.pubKeyJWT);
  }
}
</script>

<style lang="scss">
#seed {
  height: 150px;
  width: 250px;
}
</style>
