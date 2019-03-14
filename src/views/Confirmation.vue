<template>
  <div v-if="isObject" class="container">
    <div class="row justify-content-center">
      <div class="jumbotron text-ightindigo text-left p-3">
        <h5 class="text-lightviolet">
          Confirmation! <b class="text-warning">{{CONFIRM_TX.length}}</b>
        </h5>
        <p class="text-indigo">
          Type: <b class="text-ightindigo">{{CONFIRM_TX.type}}</b>
          <br>
          Amount: 
          <b class="text-ightindigo">
            {{CONFIRM_TX.amount | fromZil}}
          </b>
          <span class="text-warning">
            {{currencyController.nativeCurrency}}
          </span>
          <br>
          Amount: 
          <b class="text-ightindigo">
            {{CONFIRM_TX.amount | toUSD(currencyController.conversionRate)}}
          </b>
          <span class="text-warning">
            {{currencyController.currentCurrency}}
          </span>
          <br>
          <b v-if="data && data.title">
            app: <b class="text-ightindigo">{{data.title}}</b>
          </b>
        </p>
        
        <hr class="my-4">

        <div v-if="data && data.favIconUrl"
             class="d-flex justify-content-center">
          <img  :src="data.favIconUrl" height="50">
        </div>

        <div class="row m-2 text-center justify-content-center">
          <div>
            <a class="text-truncate text-ightindigo"
               :href="exploreAddress(from)" target="_blanck">
              Account 1
            </a>
          </div>

          <b class="ml-5 text-pink">&#62;</b>

          <div class="ml-5">
            <a class="text-truncate text-warning"
               :href="exploreAddress(CONFIRM_TX.toAddr)" target="_blanck">
              {{CONFIRM_TX.toAddr | trimAddress}}
            </a>
          </div>
        </div>

        <form class="col">
          <div class="form-group">
            <label for="gas">Gas Price (ZILs)</label>
            <input type="text"
                   class="form-control bg-null"
                   id="gas"
                   :value="CONFIRM_TX.gasPrice | fromZil"
                   @change="setGasPriceForConfirm">
          </div>
          <div class="form-group">
            <label for="gas">Gas Limit (ZILs)</label>
            <input type="number"
                   step="1"
                   class="form-control bg-null"
                   id="gas"
                   :value="CONFIRM_TX.gasLimit"
                   @change="setGasLimitForConfirm">
          </div>

          <div class="p-2">
            <button v-btn="'success btn-lg mr-2'"
                    @click="confirm">CONFIRM</button>
            <button v-btn="'danger btn-lg ml-2'"
                    @click="rejectConfirmTx">REJECT</button>
          </div>
      </form>

      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions, mapMutations, mapGetters } from 'vuex'
import trimAddress from '../filters/trimAddress'
import { fromZil, toUSD } from '../filters/zil'
import explorer from '../mixins/explorer'
import btn from '../directives/btn'


export default {
  name: 'Confirmation',
  filters: { trimAddress, fromZil, toUSD },
   directives: { btn },
  mixins: [explorer],
  data() {
    return {
      data: window.data,
      // from: 'eef22809b26479ce53f52a0849dbbdad630e0f35',
      // to: '31de24752489e04d06ad32a1095b86ce9310bf9b',
      // amount: '5783495734904'
      //11d3cfe90a863245a00cff9d069ffc27585ee764
    };
  },
  computed: {
    ...mapState([
      'currencyController'
    ]),
    ...mapState('storage', [
      'wallet',
      'confirmationTx'
    ]),
    ...mapGetters('storage', [
      'CONFIRM_TX'
    ]),

    from() {
      return this.wallet.identities[
        this.wallet.selectedAddress
      ].address;
    },
    isObject() {
      if (Object.keys(this.CONFIRM_TX).length > 0) {
        return true;
      } else {
        if (window.data) {
          window.close();
        } else {
          this.$router.push({ name: 'home' });
        }        
        return false;
      }
    }
  },
  methods: {
    ...mapMutations(['spiner']),
    ...mapMutations('storage', [
      'setGasPriceForConfirm',
      'setGasLimitForConfirm'
    ]),
    ...mapActions('storage', [
      'getConfirmationTx',
      'rejectConfirmTx',
      'confirmTx'
    ]),

    async confirm() {
      this.spiner();
      await this.confirmTx();
      this.spiner();
    }
  },
  mounted() { }
}
</script>

<style lang="scss">
.jumbotron {
  min-width: 310px;
  font-size: 14px;
}
</style>
