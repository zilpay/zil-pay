<template>
  <div>
    <BackBar/>
    
    <main class="is-mini">
      <div class="top-bar">
        <button class="btn-outline"
                @click="createAccountBySeed">Create</button>
        <button class="btn-outline"
                @click="$router.push({name: 'Import'})">Import</button>
      </div>

      <div v-for="(acc, index) of wallet.identities"
           :key="acc.address"
           @click="selectAccount(index)"
           class="cards pointer">
        <div class="card text-white"
             :style="{backgroundColor: addressToColor(acc.address)}">
          <div class="header">
            <div>
              {{acc.name || (`Account ${acc.index + 1}`)}}
              <span v-show="acc.isImport" class="imported">Imported</span>
            </div>
            <img v-show="index == wallet.selectedAddress"
                 src="/icons/selected.svg" height="25">
          </div>
          <div class="body">
            <div>
              {{acc.balance | fromZil}} <span>ZIL</span>
            </div>
            <div>
              ≈ {{acc.balance | toConversion(conversionRate[currency])}} 
              <span>{{currency}}</span>
            </div>
          </div>
          <div class="footer">
            <div>{{acc.address | toAddress(addressFormat, false)}}</div>
            <img src="/icons/copy.svg"
                 height="17" v-tooltip="'Copy'"
                 @click="copy(acc.address)">
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import tooltip from '../directives/tooltip'
import clipboardMixin from '../mixins/clipboard'
import AccountListing from '../mixins/account-listing'
import toConversion from '../filters/to-conversion'
import fromZil from '../filters/from-zil'

const BackBar = () => import('../components/BackBar');


export default {
  name: 'Accounts',
  mixins: [clipboardMixin, AccountListing],
  filters: { toConversion, fromZil },
  components: { BackBar },
  directives: { tooltip },
  computed: {
    ...mapState(['conversionRate']),
    ...mapState('Static', [
      'currency'
    ])
  }
}
</script>

<style lang="scss">
.cards {
  .card {
    margin: 10px;
  }
}
.top-bar {
  justify-self: center;
  button {
    margin: 7px;
  }
}
.imported {
  font-weight: 600;
}
</style>
