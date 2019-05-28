
import { mapState } from 'vuex'
import apiConfig from '../../config/api.json'
import toAddress from '../filters/toAddress'


export default {
  computed: {
    ...mapState('Static', [
      'network'
    ]),
    ...mapState('Static', [
      'addressFormat'
    ]),
    net() {
      return `network=${this.network}`;
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
      address = toAddress(
        address,
        this.addressFormat,
        false
      );
      return `${this.url}/address/${address}?${this.net}`;
    }
  }
}
