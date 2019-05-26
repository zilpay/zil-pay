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
    copy() {
      const address = toAddress(
        this.account.address,
        this.addressFormat,
        false
      );
      copy(address);
    }
  }
}