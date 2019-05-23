<template>
  <div>
    <BackBar/>

    <main>
      <div class="top-bar">
        <button class="btn-outline">Create</button>
        <button class="btn-outline"
                @click="$router.push({name: 'Import'})">Import</button>
      </div>

      <div class="cards">
        <div class="card text-white">
          <div class="header">
            <div>warden</div>
            <img src="/icons/selected.svg" height="25">
          </div>
          <div class="body">
            <div>1000 <span>ZIL</span></div>
            <div>≈ 30 <span>USD</span></div>
          </div>
          <div class="footer">
            <div>{{account.address}}</div>
            <img src="/icons/copy.svg"
                 height="17" v-tooltip="'Copy'"
                 @click="copy(account.address)">
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script>
import tooltip from '../directives/tooltip'
import copy from 'clipboard-copy'

const BackBar = () => import('../components/BackBar');


export default {
  name: 'Accounts',
  components: { BackBar },
  directives: { tooltip },
  data() {
    return {
      account: {
        address: 'bc1qngw83fg8dz0k749cg7k3emc7v98wy0c74dlrkd',
        balance: '312.3',
        name: 'warden'
      }
    };
  },
  methods: {
    copy
  }
}
</script>

<style lang="scss">
.cards {
  padding: 10px;
}
.top-bar {
  justify-self: center;
  button {
    margin: 10px;
  }
}
</style>
