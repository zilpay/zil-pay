import { filter, take, map } from 'rxjs/operators'
import uuidv4 from 'uuid/v4'
import {
  MTypesSecure,
  MTypesZilPay
} from '../../lib/messages/messageTypes'
import { SecureMessage } from '../../lib/messages/messageCall'
import { from } from 'rxjs'


var _stream = new WeakMap();
var _subject = new WeakMap();


export default class HTTPProvider {

  constructor(subjectStream, stream) {
    if (!subjectStream || !stream) {
      throw new Error('subjectStream and stream is necessary params.');
    }

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
  }  

  send(method, params) {
    const type = MTypesZilPay.PROXY_MEHTOD;
    const recipient = MTypesSecure.CONTENT;
    const uuid = uuidv4();

    new SecureMessage({
      type, payload: { params, method, uuid }
    }).send(_stream, recipient);

    return from(_subject).pipe(
      filter(res => res.type === MTypesZilPay.PROXY_RESULT),
      map(res => res.payload),
      filter(res => res.uuid && res.uuid === uuid),
      take(1)
    ).toPromise();
  }

}