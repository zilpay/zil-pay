import { mapState } from 'vuex'
import apiConfig from '../config/api'


export default {
  computed: {
    ...mapState('storage', [
      'selectedNet'
    ]),

    url() {
      return apiConfig.EXPLORER[this.selectedNet];
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