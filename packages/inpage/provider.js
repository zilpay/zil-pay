/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { v4 } from 'uuid'
import { RPCMethod } from '@zilliqa-js/core/dist/net'

import { from } from 'rxjs'
import { filter, take, map } from 'rxjs/operators'

import { TypeChecker } from 'lib/type'
import {
  SecureMessage,
  MTypeTabContent,
  MTypeTab
} from 'lib/stream'

// Private variables. //
/**
 * Stream instance.
 */
let _stream = null
/**
 * Listener instance.
 */
let _subject = null

/**
 * HTTP Proxy provider.
 * this provider proxyed all http requests to content.js
 * and encrypted all data.
 */
export default class HTTPProvider {

  constructor(subjectStream, stream) {
    this.middleware = {
      request: {
        use() {}
      },
      response: {
        use() {}
      }
    }
    _stream = stream
    _subject = subjectStream

    this.RPCMethod = RPCMethod

    this.RPCMethod.GetMinerInfo = 'GetMinerInfo'
    this.RPCMethod.GetPendingTxns = 'GetPendingTxns'
  }

  send(method, ...params) {
    if (this.RPCMethod.CreateTransaction === method
        && new TypeChecker(params.signature).isUndefined) {
      return { error: null, result: {} }
    }

    const type = MTypeTab.CONTENT_PROXY_MEHTOD
    const recipient = MTypeTabContent.CONTENT
    // Request id.
    const uuid = v4()

    // Send to content.js
    new SecureMessage({
      type, payload: { params, method, uuid }
    }).send(_stream, recipient)

    // Waiting for an answer from content.js.
    return from(_subject).pipe(
      filter(res => res.type === MTypeTab.CONTENT_PROXY_RESULT),
      map(res => res.payload),
      filter(res => res.uuid && res.uuid === uuid),
      map(res => {
        if (res.error) {
          throw res.error
        }

        delete res.uuid

        return res
      }),
      take(1)
    ).toPromise()
  }

}
