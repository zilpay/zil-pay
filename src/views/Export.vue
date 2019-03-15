<template>
  <div class="container">
    <div class="row justify-content-center text-center">
      <h3 class="col-lg-12 text-pink">
        Account export
      </h3>
      
      <div v-if="text">
        <textarea class="form-control bg-null"
                  v-model="text"
                  id="mySeed"
                  disabled>
        </textarea>
        <button v-btn="'info btn-lg m-2'"
                @click="copy(text)">
          copy
        </button>
        <button v-btn="'warning btn-lg m-2'"
                @click="$router.push({name: 'home'})">
          close
        </button>
      </div>


      <div v-if="!text" class="form-group pt-2">
        <label for="pass">Enter password to continue</label>
        <input type="password"
               class="form-control bg-null text-pink"
               id="pass"
               autofocus
               placeholder="Password"
               v-model="password"
               @input="wrongPassword = false">
        <div class="error text-danger" v-if="wrongPassword">
          Incorrect password
        </div>
        
        <button v-btn="'info btn-lg btn-block mt-4'"
                :disabled="!password"
                @click="onSubmit">
          continue
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import copy from 'clipboard-copy'
import btn from '../directives/btn'
import { exportTypes } from '../lib/messages/messageTypes'


export default {
  name: 'Export',
  directives: { btn },
  data() {
    return {
      text: null,
      password: null,
      wrongPassword: false
    };
  },
  computed: {
    type() {
      const type = this.$router
                       .history
                       .current
                       .params
                       .type;
      if (type == exportTypes.PRIVATE_KEY || type == exportTypes.SEED) {
        return type;
      } else {
        return exportTypes.PRIVATE_KEY;
      }
    }
  },
  methods: {
    copy,
    ...mapActions('storage', [
      'exportSeed',
      'exportPrivKey'
    ]),

    async revealSeedWords() {
      if (this.wrongPassword) {
        return null;
      }

      try {
        this.text = await this.exportSeed(this.password);
      } catch(err) {
        this.wrongPassword = true;
      }
    },
    async revealPrivateKey() {
      if (this.wrongPassword) {
        return null;
      }

      try {
        this.text = await this.exportPrivKey(this.password);
      } catch(err) {
        this.wrongPassword = true;
      }
    },
    onSubmit() {
      if (this.type === exportTypes.SEED) {
        this.revealSeedWords();
      } else if (this.type === exportTypes.PRIVATE_KEY) {
        this.revealPrivateKey();
      }
    }
  },
  mounted() { }
}
</script>

<style lang="scss">
@import '../styles/colors';
#mySeed {
  cursor: pointer;
  font-size: 30px;
  height: 200px;
}
#mySeed:hover {
  box-shadow: inset 0px 0px 40px $lightviolet;
}
</style>
