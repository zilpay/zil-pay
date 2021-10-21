/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */

import type { TabStream } from "lib/streem/tab-stream";
import type { InpageWallet } from "types/account";
import type { Subject } from "./subject";

export class Wallet {
  #stream: TabStream;
  #subject: Subject;

  #isConnect = false;
  #isEnable = false;
  #net = 'mainnet';
  #defaultAccount: InpageWallet | null = null;

  public get isConnect() {
    return this.#isConnect;
  }

  public get isEnable() {
    return this.#isConnect;
  }

  public get net() {
    return this.#net;
  }

  public get defaultAccount() {
    return this.#defaultAccount;
  }

  constructor(stream: TabStream, subject: Subject) {
    this.#stream = stream;
    this.#subject = subject;
  }

  public observableAccount() {}

  public observableNetwork() {}

  public observableTransaction() {}

  public addTransactionsQueue() {}

  public sign() {}

  public connect() {}
}
