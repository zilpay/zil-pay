<template>
  <div>
    <main class="is-mini">
      <div class="dapp text-center">
        <img :src="connect.icon">
        <div class="title">{{connect.title}}</div>
        <label>{{connect.domain}}</label>
      </div>

      <p class="text-center">This site is requesting access
         to view your current account address.
      </p>

      <div class="btns-access">
        <button class="btn-outline" @click="reject">Cancel</button>
        <button @click="confirm">connect</button>
      </div>
      
    </main>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { BrowserStorage, BuildObject } from '../../lib/storage'
import fields from '../../config/fields'


async function removeConnection() {
  const storage = new BrowserStorage();
  storage.set(new BuildObject(fields.CONNECT_DAPP, {}));
}

export default {
  name: 'Connect',
  computed: {
    ...mapState('Static', [
      'connect'
    ])
  },
  methods: {
    ...mapMutations('Static', [
      'mutateDappsList'
    ]),

    async reject() {
      await removeConnection();
      window.window.close();
    },
    async confirm() {
      this.mutateDappsList(this.connect);
      await removeConnection();
      window.window.close();
    }
  }
}
</script>

<style lang="scss">
.dapp {
  margin-top: 30px;
  display: grid;
  justify-items: center;
  
  .title {
    margin-top: 5px;
    font-weight: 600;
  }
}

main > p {
  font-size: 15px;
  width: 50%;
  justify-self: center;
}
.btns-access {
  margin-top: 30%;
  justify-self: center;
  padding: 10px;

  button {
    margin: 10px;
  }
}
</style>
