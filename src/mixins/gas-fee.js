import { mapState, mapMutations } from 'vuex'

export default {
  data() {
    return {
      gasLimit: 1,
      gasPrice: 1000,

      gasMutate: false
    };
  },
  computed: {
    ...mapState('Static', [
      'defaultGas'
    ]),

    fee() {
      return this.gasLimit * this.gasPrice * Math.pow(10, -6);
    }
  },
  methods: {
    ...mapMutations('Static', [
      'mutateGasLimit',
      'mutateGasPrice'
    ])
  },
  watch: {
    gasLimit(newGasLimit) {
      if (this.gasMutate) {
        this.mutateGasLimit(newGasLimit);
      }
    },
    gasPrice(newGasLimit) {
      if (this.gasMutate) {
        this.mutateGasPrice(newGasLimit);
      }
    }
  },
  mounted() {
    this.gasLimit = this.defaultGas.gasLimit;
    this.gasPrice = this.defaultGas.gasPrice;
  }
}