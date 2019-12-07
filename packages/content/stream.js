/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { NonSecureStream } from './localStream'
import { SecureStream } from './encryptedStream'

export class Stream {

  constructor() {
    this.secureStream = new SecureStream()
    this.nonSecureStream = new NonSecureStream(this.secureStream.stream)
  }

}
