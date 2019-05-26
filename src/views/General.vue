<template>
  <div>
    <BackBar/>

    <main>
      <div class="text-left" @mouseleave="isCurrencyInput = false">
        <span>Currency Conversion</span>
        <div class="dropdown-el" @click="isCurrencyInput = !isCurrencyInput">
          {{currency}}
          <img src="/icons/drop-down-arrow.svg" height="15">
        </div>
        
        <div class="dropdown-input text-black" v-show="isCurrencyInput">
          <div class="item"
                v-for="item of items"
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
        
        <div class="dropdown-input text-black" v-show="isFormatAddress">
          <div class="item"
                v-for="item of Formats"
                :key="item"
                @click="selectedFormat(item)">
            <div class="name">{{item}}</div>
          </div>
        </div>
      </div>

      <div>
        <h5>Clear history transaction.</h5>
        <button>Clear</button>
      </div>
    </main>
  </div>
</template>

<script>
const BackBar = () => import('../components/BackBar');


export default {
  name: 'General',
  components: { BackBar },
  data() {
    return {
      isCurrencyInput: false,
      isFormatAddress: false,

      currency: 'USD',
      items: ['BTC', 'ETH', 'TRX'],

      addressFormat: 'Bech32',
      Formats: ['Bech32', 'Base58', 'Hex']
    };
  },
  methods: {
    selectedCurrency(item) {
      this.currency = item;
      this.isCurrencyInput = false;
    },
    selectedFormat(item) {
      this.addressFormat = item;
      this.isFormatAddress = false;
    },
  }
}
</script>

<style lang="scss">
.format {
  margin-top: 50px;
}
</style>
