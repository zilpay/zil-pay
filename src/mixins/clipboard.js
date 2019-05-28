import { mapState } from 'vuex'
import copy from 'clipboard-copy'
import toAddress from '../filters/toAddress'


export default {
  filters: { toAddress },
  computed: {
    ...mapState('Static', [
      'addressFormat'
    ])
  },
  methods: {
    toAddress,
    copy(hex) {
      const address = toAddress(
        hex || this.account.address,
        this.addressFormat,
        false
      );
      copy(address);
    }
  }
}