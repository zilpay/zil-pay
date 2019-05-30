import { mapState, mapMutations } from 'vuex'

export default {
  data() {
    return {
      gasLimit: 1,
      gasPrice: 1000,

      gasMutate: false,
      factor: Math.pow(10, -6)
    };
  },
  computed: {
    ...mapState('Static', [
      'defaultGas'
    ]),

    fee() {
      const amount = this.gasLimit * this.gasPrice * this.factor;
      return amount.toFixed(3);
    }
  },
  methods: {
    ...mapMutations('Static', [
      'mutateGasLimit',
      'mutateGasPrice'
    ]),

    toDefaultGas() {
      this.gasLimit = 1;
      this.gasPrice = 1000;
    }
  },
  watch: {
    gasLimit(newGasLimit) {
      if (this.gasMutate && newGasLimit) {
        this.mutateGasLimit(newGasLimit);
      }
    },
    gasPrice(gasPrice) {
      if (this.gasMutate && gasPrice) {
        this.mutateGasPrice(gasPrice);
      }
    }
  },
  mounted() {
    if (this.defaultGas.gasLimit && this.defaultGas.gasPrice) {
      this.gasLimit = this.defaultGas.gasLimit;
      this.gasPrice = this.defaultGas.gasPrice;
    }
  }
}