<template>
  <div>
    <BackBar/>

    <main class="animated fadeIn faster is-mini">
      <div class="text-left" @mouseleave="isCurrencyInput = false">
        <span>Currency Conversion</span>
        <div class="dropdown-el" @click="isCurrencyInput = !isCurrencyInput">
          {{currency}}
          <img src="/icons/drop-down-arrow.svg" height="15">
        </div>
        
        <div class="animated fadeIn fast dropdown-input text-black" v-show="isCurrencyInput">
          <div class="item"
                v-for="item of currencyItems"
                :key="item"
                @click="selectedCurrency(item)">
            <div class="name">{{item}}</div>
          </div>
        </div>
      </div>

      <div class="format text-left" @mouseleave="isFormatAddress = false">
        <span>Address format</span>
        <div class="dropdown-el" @click="isFormatAddress = !isFormatAddress">
          {{addressFormat}}
          <img src="/icons/drop-down-arrow.svg" height="15">
        </div>
        
        <div class="animated fadeIn fast dropdown-input text-black" v-show="isFormatAddress">
          <div class="item"
                v-for="item of addressFormatItems"
                :key="item"
                @click="selectedFormat(item)">
            <div class="name">{{item}}</div>
          </div>
        </div>
      </div>

      <div>
        <h5>Clear history transaction.</h5>
        <button @click="clearTx">Clear</button>
      </div>
    </main>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
const BackBar = () => import('../components/BackBar');


export default {
  name: 'General',
  components: { BackBar },
  data() {
    return {
      isCurrencyInput: false,
      isFormatAddress: false
    };
  },
  computed: {
    ...mapState('Static', [
      'currency',
      'currencyItems',

      'addressFormat',
      'addressFormatItems'
    ])
  },
  methods: {
    ...mapMutations('Static', [
      'mutateCurrency',
      'mutateAddressFormat'
    ]),
    ...mapActions('Transactions', [
      'clearTransactions'
    ]),

    selectedCurrency(item) {
      this.mutateCurrency(item);
      this.isCurrencyInput = false;
    },
    selectedFormat(item) {
      this.mutateAddressFormat(item);
      this.isFormatAddress = false;
    },
    clearTx() {
      this.clearTransactions();
      this.$router.push({ name: 'Home' });
    }
  }
}
</script>

<style lang="scss">
.format {
  margin-top: 50px;
}
</style>
