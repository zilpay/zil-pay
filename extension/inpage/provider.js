import { filter, take } from 'rxjs/operators';
import uuidv4 from 'uuid/v4'
import {
  MTypesSecure,
  MTypesZilPay
} from '../../lib/messages/messageTypes'
import { SecureMessage } from '../../lib/messages/messageCall'
import { from } from 'rxjs';


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
    this.stream = stream;
    this.subject = subjectStream;
  }  

  send(method, params) {
    const type = MTypesZilPay.PROXY_MEHTOD;
    const recipient = MTypesSecure.CONTENT;
    const uuid = uuidv4();

    new SecureMessage({
      type, payload: { params, method, uuid }
    }).send(this.stream, recipient);

    return from(this.subject).pipe(
      filter(res => res.uuid === uuid),
      take(1)
    ).toPromise();
  }

}