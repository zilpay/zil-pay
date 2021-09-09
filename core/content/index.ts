import { Message } from 'lib/streem/message';
import { MTypeTab } from 'lib/streem/stream-keys';

window['Message'] = Message;


new Message({
  type: MTypeTab.CONNECT_APP
}).send().then(console.log);
