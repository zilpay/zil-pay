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

import { ERROR_MSGS } from './errors'

export class ContentBackgroundStream {

  _watchTabMessaging(cb) {
    if (!new TypeChecker(cb).isFunction) {
      throw new TypeError(`cb ${ERROR_MSGS.MUST_BE_CALLBACK}`)
    }

    LocalStream.watch((request, response) => {
      const message = new SecureMessage(request)

      cb(response, message)
    })
  }

}
