import uuidv4 from 'uuid/v4'
import { filter, take, map } from 'rxjs/operators'
import { from } from 'rxjs'
import { RPCMethod } from '@zilliqa-js/core'

import { TypeChecker } from 'lib/type'
import {
  SecureMessage,
  MTypeSecure,
  MTypeTab
} from 'lib/stream'

// Private variables. //
/**
 * Stream instance.
 */
let _stream = new WeakMap()
/**
 * Listener instance.
 */
let _subject = new WeakMap()

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
  }  

  send(method, ...params) {
    if (this.RPCMethod.CreateTransaction === method
        && new TypeChecker(params.signature).isUndefined) {
      return { error: null, result: {} }
    }

    const type = MTypeTab.CONTENT_PROXY_MEHTOD
    const recipient = MTypeSecure.CONTENT
    // Request id.
    const uuid = uuidv4()

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
