import { Stream } from './stream'
import { ZilPay } from './zilPay'


export class InPage extends Stream {

  constructor(provider) {
    super();
    this.onEncryptedStream();
    window.ZilPay = new ZilPay(provider);
    this.subscribe(); // from stream
  }

}