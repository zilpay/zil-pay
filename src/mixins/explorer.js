import { mapState } from 'vuex'
import apiConfig from '../config/api'


export default {
  computed: {
    ...mapState('storage', [
      'selectednet'
    ]),

    url() {
      return apiConfig.EXPLORER[this.selectednet];
    }
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