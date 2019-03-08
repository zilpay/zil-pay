
import { Stream } from './stream'
import { ZilPay } from './zilPay'


export class InPage extends Stream {

  constructor(provider) {
    super();
    window.ZilPay = new ZilPay(provider);
    this.onEncryptedStream();
    this.subscribe(); // from stream
  }

}