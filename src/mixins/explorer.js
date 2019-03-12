import apiConfig from '../config/api'


export default {
  data() {
    return {
      url: apiConfig.EXPLORER
    };
  },
  methods: {
    exploreTransactions(hash) {
      return `${this.url}/transactions/${hash}`;
    },
    exploreAddress(address) {
      return `${this.url}/address/${address}`;
    },
  }
}