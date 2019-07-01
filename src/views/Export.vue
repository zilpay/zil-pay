<template>
  <div>
    <BackBar/>

    <main class="animated fadeIn faster export is-mini">
      <small class="warning-msg text-center">
        DO NOT share this information with anyone!
      </small>

      <div class="header" v-show="textarea">
        <label>{{label}}</label>
        <br>
        <textarea class="seed" cols="30" v-model="textarea"></textarea>
      </div>

      <form class="input-group"
            v-show="!textarea"
            @submit.prevent="onExport">
         <div class="text-left">
          <label>Password</label>
          <input type="password" autofocus v-model="password">
          <small v-show="wrongPassword"
                 class="text-danger">
            Wrong password.
          </small>
        </div>
        <input class="btn" type="submit" value="Export"
               @submit.prevent="onExport">
      </form>
    </main>
  </div>
</template>

<script>
import { mapMutations } from 'vuex'
import { MTypesAuth } from '../../lib/messages/messageTypes'
import { Message } from '../../lib/messages/messageCall'

const BackBar = () => import('../components/BackBar');


async function exportSeed(password) {
  const result = await new Message({
    type: MTypesAuth.EXPORT_SEED,
    payload: { password }
  }).send();

  if (result.resolve) {
    return result.resolve;
  } else if (result.reject) {
    throw new Error(result.reject);
  }

  return null;
}
async function exportPrivKey(password) {
  const result = await new Message({
    type: MTypesAuth.EXPORT_PRIV_KEY,
    payload: { password }
  }).send();

  if (result.resolve) {
    return result.resolve;
  } else if (result.reject) {
    throw new Error(result.reject);
  }

  return null;
}

export default {
  name: 'Export',
  components: { BackBar },
  data() {
    return {
      textarea: null,
      password: null, wrongPassword: null
    };
  },
  computed: {
    type() {
      return this.$router.currentRoute.params.type;
    },
    label() {
      if (this.type == 'key') {
        return 'Your PrivateKey.';
      }
      if (this.type == 'seed') {
        return 'Your mnemonic word phrase.';
      }
      return null;
    }
  },
  methods: {
    ...mapMutations(['spiner']),

    async revealPrivateKey() {
      if (this.wrongPassword) {
        return null;
      }
      try {
        this.textarea = await exportPrivKey(this.password);
      } catch(err) {
        this.wrongPassword = true;
      }
    },
    async revealSeedWords() {
      if (this.wrongPassword) {
        return null;
      }
      try {
        this.textarea = await exportSeed(this.password);
      } catch(err) {
        this.wrongPassword = true;
      }
    },
    async onExport() {
      this.spiner();
      if (this.type == 'key') {
        await this.revealPrivateKey();
      }
      if (this.type == 'seed') {
        await this.revealSeedWords();
      }
      this.spiner();
    }
  }
}
</script>

<style lang="scss">
.export {
  justify-items: center;

  & > .input-group > .btn {
    margin-top: 40px;
    width: 100%;
  }
}
</style>