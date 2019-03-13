
import { Stream } from './stream'
import { ZilPay } from './zilPay'


export class InPage extends Stream {

  constructor(provider) {
    super();
    window.ZilPay = new ZilPay(provider);
    window.ZilPay.wallet.__proto__.sign = this.signOverrided;
    // window.ZilPay.blockchain.createTransaction = this.signOverrided;
  }

}