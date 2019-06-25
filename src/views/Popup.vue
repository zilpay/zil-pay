<template>
  <div class="animated fadeIn faster">
    <div class="send-recipient">
      <a :href="exploreAddress(account.address)"
         target="_blacnk">
        {{account.name}}
      </a>
      <img src="/icons/caret-right.svg"
           height="30" class="img-border">
      <a :href="exploreAddress(CONFIRM_TX.toAddr)"
         target="_blacnk">
        {{CONFIRM_TX.toAddr | toAddress(addressFormat)}}
      </a>
    </div>    
    <main class="text-center popup">

      <img :src="CONFIRM_TX.icon || '/favicon.ico'" height="50">

      <h5>Transaction 1</h5>

      <div class="input-group">
        <div class="form-border text-left details">
          <div>
            type: <span class="text-black">{{CONFIRM_TX.type}}</span>
            <br>
            method: <span class="text-black">{{CONFIRM_TX.method}}</span>
            <br>
            amount: <span class="text-black">
              {{CONFIRM_TX.amount | fromZil}} 
              <span class="text-primary">ZIL</span>
              ≈ {{CONFIRM_TX.amount | toConversion(conversionRate[currency])}} 
              <span class="text-primary">{{currency}}</span>
            </span>
            <br>
            DApp: <span class="text-black">{{CONFIRM_TX.title || 'ZilPay'}}</span>
          </div>
        </div>

        <small class="text-danger">
          {{isMaxAmount || errMsg}}
        </small>

        <div class="text-primary text-right advance"
             @click="isAdvance = !isAdvance">
          <div class="text-left">fee: {{fee}}</div>
          {{isAdvance ? '-': '+'}} Advance
        </div>

        <div class="animated fadeIn gas" v-show="isAdvance">
          <div class="text-left">
            <label for="gas-limit">Gas Limit</label>
            <input type="number" id="gas-limit" v-model="gasLimit">
          </div>
          <div class="text-left">
            <label for="gas-price">Gas Price (Li)</label>
            <input type="number" id="gas-price" v-model="gasPrice">
          </div>
        </div>

        <div class="btn-group">
          <button @click="confirm">confirm</button>
          <button class="btn-outline" @click="reject">reject</button>
        </div>
      </div>
      <hr>
    </main>
  </div>
</template>

<script>
import { BN, units } from '@zilliqa-js/util'
import { mapGetters, mapState, mapActions, mapMutations } from 'vuex'
import GasFee from '../mixins/gas-fee'
import ExplorerMixin from '../mixins/explorer'
import clipboardMixin from '../mixins/clipboard'
import AccountListing from '../mixins/account-listing'
import StateUpdater from '../mixins/status-updater'
import toConversion from '../filters/to-conversion'
import fromZil from '../filters/from-zil'
import toZIL from '../filters/to-zil'
import { ERRORCODE } from '../../lib/errors/code'
import LedgerControll from '../../lib/hardware/ledger'

const ledgerControll = new LedgerControll();

export default {
  name: 'Send',
  mixins: [
    GasFee,
    ExplorerMixin,
    AccountListing,
    clipboardMixin,
    StateUpdater
  ],
  filters: { toConversion, fromZil },
  data() {
    return {
      isAdvance: false,
      isInput: false,

      data: null,
      popupId: null,
      errMsg: null
    };
  },
  computed: {
    ...mapState(['conversionRate']),
    ...mapState('Static', [
      'currency'
    ]),
    ...mapState('Transactions', [
      'confirmationTx'
    ]),
    ...mapGetters('Transactions', [
      'CONFIRM_TX'
    ]),

    isMaxAmount() {
      try {
        const amountBN = new BN(this.CONFIRM_TX.amount);
        const balanceBN = new BN(this.account.balance);
        const feeBN = new BN(toZIL(this.fee));
        const txAmountBN = feeBN.add(amountBN);
        const isInsufficientFunds = balanceBN.lt(txAmountBN);

        if (isInsufficientFunds) {
          return ERRORCODE[1];
        }
      } catch(err) {
        return ERRORCODE[3];
      }

      return null;
    },
    txParams() {
      const txs = this.confirmationTx;
      const length = txs.length;
      return txs[length - 1];
    }
  },
  methods: {
    ...mapMutations(['spiner']),
    ...mapActions('Transactions', [
      'rejectConfirmTx',
      'confirmTx',
      'buildTxParams',
      'sendSignTx'
    ]),

    async reject() {
      await this.rejectConfirmTx();
      this.popupClouse();
    },
    async confirm() {
      this.spiner();

      const gasFee = {
        gasPrice: units.toQa(this.gasPrice, units.Units.Li).toString(),
        gasLimit: this.gasLimit
      };

      try {
        if (this.account.hwType) {
          await this.hwConfirm(gasFee);
        } else {
          await this.confirmTx(gasFee);
        }
        this.popupClouse();
      } catch(err) {
        this.errMsg = err.message;
      }

      this.spiner();
    },
    async hwConfirm ({ gasPrice, gasLimit }) {
      let txParams;

      txParams = await this.buildTxParams({
        txParams: this.txParams,
        from: this.account.address
      });
      
      txParams.gasPrice = gasPrice;
      txParams.gasLimit = gasLimit;
      txParams.pubKey = this.account.pubKey;

      txParams.signature = await ledgerControll.sendTransaction(
        this.account.index,
        txParams
      );
      txParams.from = this.account.address;
      return await this.sendSignTx(txParams);
    },

    popupClouse() {
      if (!this.confirmationTx || this.confirmationTx.length < 1) {
        window.window.close();
      }      
    }
  },
  mounted() {
    this.upadteAllState();
    this.gasPrice = units.fromQa(
      new BN(this.CONFIRM_TX.gasPrice),
      units.Units.Li
    ).toString();
    this.gasLimit = this.CONFIRM_TX.gasLimit;
  }
}
</script>

<style lang="scss">
.popup {
  margin: 30px;
}
.details {
  padding: 10px;
  font-size: 15px;
}
.send-recipient {
  background-color: rgba(77, 77, 77, 0.123);
  padding: 10px;
  font-size: 15px;

  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  justify-items: center;

  img {
    margin-left: 20px;
  }
}
.btn-group > button {
  margin: 10px;
}
</style>