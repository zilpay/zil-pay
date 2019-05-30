<template>
  <div class="row" v-if="transactionsList">

    <div class="text-left title">History</div>

    <ul class="list text-black">
      <li v-for="tx of transactionsList"
          :key="tx.nonce"
          @click="toView(tx.TranID)"
          class="pointer">

        <img v-if="tx.Info == call || tx.Info == deploy"
             src="/icons/contract.svg" height="20">
        <img v-if="tx.Info == send"
             src="/icons/send-dark.svg"
             height="20">

        <div class="info">
          <a :href="exploreAddress(account.address)"
             target="_blacnk"
             class="text-black underline">
            {{account.address | toAddress(addressFormat)}}
          </a>
          <img src="/icons/caret-right.svg" height="20"
              class="img-border">
          <a :href="exploreAddress(tx.toAddr)"
             class="text-black underline"
             target="_blacnk">
            {{tx.toAddr | toAddress(addressFormat)}}
          </a>
        </div>

        <div class="text-right">
          -{{tx.amount | fromZil}} 
          <span class="text-primary">ZIL</span>
        </div>

        <span class="text-left">{{tx.Info}}</span>
        <span class="text-center">view on viewblock</span>
        <div class="text-right">
          ≈ {{tx.amount | toConversion(conversionRate[currency])}} 
          <span class="text-primary">{{currency}}</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import clipboardMixin from '../mixins/clipboard'
import AccountListing from '../mixins/account-listing'
import ExplorerMixin from '../mixins/explorer'
import toConversion from '../filters/to-conversion'
import fromZil from '../filters/from-zil'


export default {
  name: 'TxList',
  mixins: [clipboardMixin, AccountListing, ExplorerMixin],
  filters: { toConversion, fromZil },
  data() {
    return {
      deploy: 'Deploy',
      call: 'Call',
      send: 'Send ZIL'
    };
  },
  computed: {
    ...mapState(['conversionRate']),
    ...mapState('Static', [
      'currency'
    ]),
    ...mapState('Transactions', [
      'transactions'
    ]),

    transactionsList() {
      if (!this.transactions || Object.keys(this.transactions).length < 1) {
        return null;
      }

      const ownList = this.transactions[this.account.address];

      if (!ownList) {
        return null;
      }

      const ownNetList = ownList[this.network];

      if (!ownNetList) {
        return null;
      }

      return ownNetList.map(tx => {
        if (tx.Info.includes('Contract Txn')) {
          tx.Info = this.call;
          return tx;
        } else if (tx.Info.includes('Contract Creation')) {
          tx.Info = this.deploy;
          return tx;
        } else if (tx.Info.includes('Non-contract')) {
          tx.Info = this.send;
        }
        return tx;
      });
    }
  }
}
</script>

<style lang="scss">
@import "../styles/color";
@import "../styles/dimensions";


.title {
  margin: 10px;
  margin-top: 20px;
  font-size: 15px;
}

.list {
  display: grid;
  grid-template-columns: 1fr;
  width: $nav-max-width;
  min-width: $nav-min-width;
  font-size: 12px;
  
  li {
    padding: 10px;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    border-top: 1px solid $color-primary;
    font-weight: 500;

    .info {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      justify-items: center;
      grid-gap: 10px;
      font-size: 10px;
    }

    &:hover {
      transition: background-color .3s ease;
      background-color: $color-translucent;
    }
  }
}
a.underline {
  border-radius: 10px;
  background: #2d4b56;
  height: 30px;
  padding: 5px;
  color: $color-initial;
  
  &:hover {
    background-color: $color-primary;
  }
}
@media screen and (max-width: $nav-max-width) {
  .list {
    margin-top: 0;
    border-radius: 0;
    width: $nav-min-width;
  }
}
</style>
