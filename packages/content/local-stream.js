/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { TypeChecker } from 'lib/type'
import { LocalStream, SecureMessage } from 'lib/stream'

export class ContentBackgroundStream {

  _watchTabMessaging(cb) {
    if (!new TypeChecker(cb).isFunction) {
      throw new Error('cb must be callback function!')
    }

    LocalStream.watch((request, response) => {
      const message = new SecureMessage(request)

      cb(response, message)
    })
  }

}
