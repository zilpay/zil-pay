<template>
  <div class="container">
    <div class="row justify-content-center">
      <img src="/img/logo.png">
    </div>
    <div class="text-center p-2 text-ightindigo display-4">

      <h5 class="point"
          id="acc-name"
          v-b-tooltip.hover
          @click="showModal">
        Account {{wallet.selectedAddress + 1}}
      </h5>
      <button v-btn="'success'"
              id="btn-copy"
              v-b-tooltip.hover
              bottom
              @click="copyAddress">
            {{account['address'] | trimAddress}}
      </button>

      <b-tooltip target="btn-copy"
                 placement="bottom">
        {{tooltipTitle}}
      </b-tooltip>

      <b-tooltip target="acc-name"
                 placement="bottom">
        Details
      </b-tooltip>

      <h5>
        {{account['balance'] | fromZil}}
        <span class="text-warning">{{currencyController.nativeCurrency}}</span>
      </h5>
      <h5>
         {{account['balance'] | toUSD(currencyController.conversionRate)}}
         <span class="text-warning">{{currencyController.currentCurrency}}</span>
      </h5>
    </div>

    <div class="row justify-content-center">
      <button disabled v-btn="'success m-2'">DEPOSIT</button>
      <button v-btn="'success m-2'"
              @click="$router.push({ name: 'send' })">SEND</button>
    </div>

    <TxTracking v-if="txArray.length > 0"
                :txs="txArray"
                :currentAccount="account"/>


    <b-modal ref="det-modal"
             centered
             hide-footer
             title="Account details"
             :header-bg-variant="headerBgVariant"
             :header-text-variant="headerTextVariant"
             :body-bg-variant="bodyBgVariant">
      <div class="d-block text-center">
        Account {{wallet.selectedAddress + 1}}
        <br>
        <img v-if="!!qrcode"
             class="m-2"
             :src="qrcode">
      </div>
      <div class="row justify-content-center">
        <button v-btn="'danger d-block m-1'"
                @click="exportPrivKey">Export privateKey</button>

        <a class="btn btn-outline-success d-block m-1"
            :href="exploreAddress(this.account.address)" target="_blanck">
            View on explorer
        </a>
      </div>
    </b-modal>
  </div>
</template>

<script>
import QRCode from 'qrcode'
import { mapState, mapActions } from 'vuex'
import copy from 'clipboard-copy'
import { fromZil, toUSD } from '../filters/zil'
import trimAddress from '../filters/trimAddress'
import btn from '../directives/btn'
import { exportTypes } from '../lib/messages/messageTypes'
import explorer from '../mixins/explorer'

const TxTracking = () => import('../components/TxTracking')


const copyToClipboard = 'copy to clipboard';

export default {
  name: 'home',
  directives: { btn },
  mixins: [explorer],
  components: { TxTracking },
  filters: { fromZil, trimAddress, toUSD },
  data() {
    return {
      tooltipTitle: copyToClipboard,
      qrcode: null,
      bodyBgVariant: 'violetbody',
      headerBgVariant: 'violet',
      headerTextVariant: 'ightindigo',
      footerBgVariant: 'darkviolet'
    };
  },
  computed: {
     ...mapState([
      'currencyController'
    ]),
    ...mapState('storage', [
      'wallet',
      'transactions',
      'selectednet'
    ]),

    account() {
      return this.wallet.identities[
        this.wallet.selectedAddress
      ];
    },
    txArray() {
      if (!this.transactions) {
        return [];
      }

      const txs = this.transactions[this.account.address];

      if (!txs) {
        return [];
      }

      if (!txs[this.selectednet]) {
        return [];
      }

      return txs[this.selectednet];
    }
  },
  methods: {
    copy,
    ...mapActions('storage', [
      'jazzicon',
      'balanceUpdate',
      'transactionsUpdate'
    ]),

    copyAddress() {
      copy('0x'+this.account.address);
      this.tooltipTitle = 'copied';
      setTimeout(() => {
        this.tooltipTitle = copyToClipboard;
      }, 2000);
    },
    showModal() {
        this.$refs['det-modal'].show();
    },
    exportPrivKey() {
      this.$router.push({
        name: 'export',
        params: { type: exportTypes.PRIVATE_KEY }
      });
    }
  },
  mounted() {
    this.jazzicon('jazzicon');

    this.balanceUpdate().then().catch(
      err => console.log('home.balanceUpdate', err.message)
    );

    this.transactionsUpdate().then().catch(
      err => console.log('home.transactionsUpdate', err.message)
    );

    QRCode.toDataURL(`zilliqa:0x${this.account.address}`, {
      color: {
        light: '#c5bfed' // Transparent background
      }
    }, (err, url) => {
      this.qrcode = url;
    });
  }
}
</script>
