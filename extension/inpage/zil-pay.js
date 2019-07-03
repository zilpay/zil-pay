import * as zilUtils from '@zilliqa-js/util'
import { Blockchain } from '@zilliqa-js/blockchain'
import { TransactionFactory } from '@zilliqa-js/account'
import { Contracts } from '@zilliqa-js/contract'
import {
  decodeBase58, encodeBase58,
  fromBech32Address, toBech32Address,
  isValidChecksumAddress, toChecksumAddress
} from '@zilliqa-js/crypto'

import HTTPProvider from './provider'
import Wallet from './wallet'


export default class Zilliqa {
  /**
   * ZipPay Object which will be create in some tab.
   * @param {*} subjectStream Listener instance.
   * @param {*} stream Stream instance.
   */

  constructor(subjectStream, stream) {
    if (!subjectStream || !stream) {
      throw new Error('subjectStream and stream is necessary params.');
    }

    // Create instance Proxy provider.
    this.provider = new HTTPProvider(subjectStream, stream);
    // Redefined Wallet to work with user interface.
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
