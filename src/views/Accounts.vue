<template>
  <div>
    <BackBar/>

    <main>
      <div class="top-bar">
        <button class="btn-outline">Create</button>
        <button class="btn-outline">Import</button>
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
                 height="17" v-tooltip="'copy'"
                 @click="copy(account.address)">
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script>
import BackBar from '../components/BackBar'
import tooltip from '../directives/tooltip'
import copy from 'clipboard-copy'


export default {
  name: 'Accounts',
  components: { BackBar },
  directives: { tooltip },
  data() {
    return {
      account: {
        address: '0x90C3269c32e328fC26C91Fb3cD107B88E74e1C7c',
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
