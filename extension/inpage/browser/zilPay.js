import { EncryptedStream } from 'extension-streams'
import { Observable, Subject } from 'rxjs'
import { catchError } from 'rxjs/operators'
import uuidv4 from 'uuid/v4'
import { MTypesSecure, MTypesZilPay, MTypesTabs } from '../../../lib/messages/messageTypes'
import { SecureMessage } from '../../../lib/messages/messageCall'

import { Blockchain } from '@zilliqa-js/blockchain'
import { TransactionFactory } from '@zilliqa-js/account'
import { Contracts } from '@zilliqa-js/contract';
import Wallet from '../wallet'
import {
  decodeBase58, encodeBase58,
  fromBech32Address, toBech32Address,
  isValidChecksumAddress, toChecksumAddress
} from '@zilliqa-js/crypto';
import * as zilUtils from '@zilliqa-js/util'
import { validation } from '@zilliqa-js/util'
import zilConf from '../../../config/zil'
import HTTPProvider from '../provider'

function getFavicon() {
  let favicon = undefined;
  let nodeList = document.getElementsByTagName('link');
  for (let i = 0; i < nodeList.length; i++)
  {
    if((nodeList[i].getAttribute('rel') == 'icon') || (nodeList[i].getAttribute('rel') == 'shortcut icon')) {
      favicon = nodeList[i].getAttribute('href');
    }
  }

  if (!favicon.includes(window.document.domain)) {
    if (favicon[0] !== '/') {
      favicon = window.location.origin + '/' + favicon;
    } else {
      favicon = window.location.origin + favicon;
    }
  }
  return favicon;        
}

// create event for listing changer address. //
var onAddressListing = window.document.createEvent('Event');
var stream = new WeakMap(); // Setup background connection.
var subjectStream = new Subject(); // Create event listing.
var ACCOUNT = {}; // Account storage.
var PROVIDER = zilConf[Object.keys(zilConf)[0]]['PROVIDER']; // Network storage.
var NET = Object.keys(zilConf)[0];

function observableStream(name, syncWith) {
  // Create Observable with encrypted stream. //
  return new Observable(subscriber => {
    // Connetc to content.js //
    stream = new EncryptedStream(name, uuidv4());
    stream.listenWith(msg => subscriber.next(msg));
    stream.sync(syncWith, stream.key);
  }).pipe(catchError(console.log));
}

class Zilliqa {
  constructor() {
    this.provider = new HTTPProvider(subjectStream, stream);
    this.wallet = new Wallet(subjectStream, stream);
    this.blockchain = new Blockchain(this.provider, this.wallet);
    this.contracts = new Contracts(this.provider, this.wallet);
    this.transactions = new TransactionFactory(this.provider, this.wallet);
    this.utils = zilUtils;
    this.crypto = {
      decodeBase58, encodeBase58,
      fromBech32Address, toBech32Address,
      isValidChecksumAddress, toChecksumAddress
    }
  }
}


export default function run() {
  // Create instance in page. //
  
  const type = MTypesSecure.PAY_OBJECT_INIT;
  const recipient = MTypesSecure.CONTENT;

  observableStream(
    MTypesSecure.INJECTED,
    MTypesSecure.CONTENT
  ).subscribe(msg => subjectStream.next(msg));

  new SecureMessage({ type, payload: {} }).send(stream, recipient);
  window.zilPay = new Zilliqa();
}
