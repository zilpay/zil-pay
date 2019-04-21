import { mapState } from 'vuex'
import apiConfig from '../config/api'


export default {
  computed: {
    ...mapState('storage', [
      'selectednet'
    ]),
    net() {
      return `network=${this.selectednet}`;
    },
    url() {
      return apiConfig.EXPLORER;
    }
  },
  methods: {
    exploreTransactions(hash) {
      return `${this.url}/tx/${hash}?${this.net}`;
    },
    exploreAddress(address) {
      return `${this.url}/address/${address}?${this.net}`;
    },
  }
}