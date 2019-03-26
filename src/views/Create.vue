<template>
  <div class="container">
    <div class="row justify-content-center display-10">
      <div class="col-lg-12 text-center text-ightindigo">
        <router-link v-if="isReady" :to="{name: 'lock'}">
          <h5 class="text-warning text-left point">&#60;back</h5>
        </router-link>
        <h5>Enter your secret twelve word
           phrase here to restore your vault.</h5>
      </div>

      <div class="form-group p-2">
        <label for="seed">Wallet Seed</label>
        <textarea class="form-control bg-null display-10 seed"
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


export default {
  name: 'Create',
  mixins: [validationMixin],
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
      'isReady'
    ]),
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
      minLength: minLength(12)
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
    ...mapMutations('storage', [
      'setWallet',
      'isEnable',
      'mutateIsReady'
    ]),
    ...mapActions('storage', [
      'randomSeed',
      'walletCreate',
      'jazzicon'
    ]),
    async submit() {
      this.spiner();

      try {
        await this.walletCreate({
          seed: this.mnemonicPhrase,
          password: this.password
        });

        this.isEnable(true);
        this.mutateIsReady(true);

        this.jazzicon('jazzicon');
        this.spiner();
        this.$router.push({ name: 'home' });
      } catch(err) {
        this.isEnable(false);
        this.mutateIsReady(false);
        this.spiner();
      }
    }
  },
  mounted() {
    this.randomSeed().then(seed => this.mnemonicPhrase = seed.resolve);
  }
}
</script>

<style lang="scss">

</style>
