import Jazzicon from 'jazzicon'


function jsNumberForAddress(address) {
  const addr = address.slice(2, 10);
  const seed = parseInt(addr, 16);
  return seed;
}

export default {
  methods: {
    jazziconMake(address, id) {
      if (!address || !id) {
        throw new Error(`address:${address}, id: ${address}`);
      }

      let ctx = window.document.querySelector('#' + id);
      let el = Jazzicon(45, jsNumberForAddress(address));
    
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