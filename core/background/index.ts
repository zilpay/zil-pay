// console.log(window.chrome);
// import { SchnorrControl } from 'lib/crypto/elliptic';


import { BrowserStorage, buildObject } from 'lib/storage';
import { localStream } from 'lib/streem/local-stream';
import { Message } from 'lib/streem/message';

window['BrowserStorage'] = BrowserStorage;
window['buildObject'] = buildObject;
window['Message'] = Message;

localStream((req, sendResponse) => {
  console.log(req);

  sendResponse();
});
