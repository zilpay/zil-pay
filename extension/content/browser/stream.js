import { NonSecureStream } from './localStream'
import { SecureStream } from './encryptedStream'

export class Stream {

  constructor() {
    this.secureStream = new SecureStream();
    this.nonSecureStream = new NonSecureStream(this.secureStream.stream);
  }

}
