import Jazzicon from 'jazzicon'
import Utils from '../../lib/utils'

export default {
  methods: {
    jazziconMake(address, id) {
      if (!address || !id) {
        throw new Error(`address:${address}, id: ${address}`);
      }

      let ctx = window.document.querySelector('#' + id);
      let el = Jazzicon(45, Utils.jsNumberForAddress(address));
    
      try {
        if (ctx && ctx.children && ctx.children.length > 0) {
          ctx.children[0].remove();
        }
        ctx.appendChild(el);
      } catch(err) {
        // * //
      }
    }
  }
}