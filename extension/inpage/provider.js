import { filter, take, map } from 'rxjs/operators'
import { from } from 'rxjs'
import uuidv4 from 'uuid/v4'
import {
  MTypesSecure,
  MTypesZilPay
} from '../../lib/messages/messageTypes'
import { SecureMessage } from '../../lib/messages/messageCall'
import { RPCMethod } from '@zilliqa-js/core'

// Private variables. //
let _stream = new WeakMap(); // Stream instance.
let _subject = new WeakMap(); // Listener instance.
// Private variables. //


// HTTP Proxy provider.
// this provider proxyed all http requests to content.js
// and encrypted all data.
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
    _stream = stream;
    _subject = subjectStream;

    this.RPCMethod = RPCMethod;
  }  

  send(method, params) {
    if (this.RPCMethod.CreateTransaction === method) {
      return { error: null, result: {} };
    }
    const type = MTypesZilPay.PROXY_MEHTOD;
    const recipient = MTypesSecure.CONTENT;
    const uuid = uuidv4(); // Request id.

    new SecureMessage({ // Send to content.js
      type, payload: { params, method, uuid }
    }).send(_stream, recipient);

    // Waiting for an answer from content.js.
    return from(_subject).pipe(
      filter(res => res.type === MTypesZilPay.PROXY_RESULT),
      map(res => res.payload),
      filter(res => res.uuid && res.uuid === uuid),
      map(res => {
        if (res.error) {
          throw res.error;
        }
        delete res.uuid;
        return res;
      }),
      take(1)
    ).toPromise();
  }

}