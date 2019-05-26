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
            <div>{{account.address | toAddress(addressFormat, false)}}</div>
            <img src="/icons/copy.svg"
                 height="17" v-tooltip="'Copy'"
                 @click="copy">
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script>
import tooltip from '../directives/tooltip'
import clipboardMixin from '../mixins/clipboard'

const BackBar = () => import('../components/BackBar');


export default {
  name: 'Accounts',
  mixins: [clipboardMixin],
  components: { BackBar },
  directives: { tooltip },
  data() {
    return {
      account: {
        address: '0xEEf22809B26479ce53F52A0849DbBDAd630E0F35',
        balance: '312.3',
        name: 'warden'
      }
    };
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
