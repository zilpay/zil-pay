/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { MinParams } from 'types/transaction';

import { uuidv4 } from 'lib/crypto/uuid';
import { Subject } from 'lib/streem/subject';

export interface U2FResponse {
  type: string;
  uuid: string;
  method: string;
  resolve?: object | string;
  reject?: string;
}

const BRIDGE_URL = 'https://zilpay.github.io/ledger-bridge/';
// const BRIDGE_URL = 'https://127.0.0.1:8080'
const TYPES = {
  init: 'ledger_bridge_ready',
  res: 'ledger_bridge_response',
  fail: 'ledger_bridge_reject',
  req: 'ledger_bridge_request'
};
const INS = [
  'getVersion',
  'getPublickKey',
  'getPublicAddress',
  'signHash',
  'signTxn'
];

export class LedgerU2F {
  readonly #subject = new Subject();
  readonly #bridge = window.document.createElement('iframe');
  #isBridgeReady = false;

  constructor() {
    this.#bridge.src = BRIDGE_URL;
  }

  public async init() {
    window.document.head.appendChild(this.#bridge);
    window.addEventListener('message', (msg) => this.#messageHandler(msg));

    return new Promise((resolve) => {
      if (this.#isBridgeReady) {
        return resolve(true);
      }

      const obs = this.#subject.on((res: U2FResponse) => {
        if (TYPES.init !== res.type) return; 
        obs();
        resolve(res.resolve);
      });
    });
  }

  public getAddresses(index = 0) {
    return this.#message(INS[2], index);
  }

  public sendTransaction(index: number, params: MinParams) {
    return this.#message(INS[4], index, params);
  }

  public signMessage(index: number, message: string) {
    return this.#message(INS[3], index, message);
  }

  async #message(method: string, ...args: any[]) {
    if (!INS.includes(method)) {
      throw new Error(`Fail method: ${method}`);
    } else if (!this.#isBridgeReady) {
      throw new Error('ledger-bridge is not loaded');
    }

    const msg = {
      method, args,
      uuid: uuidv4(),
      type: TYPES.req
    };

    this.#bridge.contentWindow.postMessage(msg, '*');

    return new Promise((resolve, reject) => {
      const obs = this.#subject.on((res: U2FResponse) => {
        if (res.type !== TYPES.res) return;
        if (res.uuid !== msg.uuid) return;
        if (res.method !== msg.method) return;

        obs();

        if (res.resolve) {
          return resolve(res.resolve);
        }

        return reject(res.reject);
      });
    });
  }

  #messageHandler({ data }) {
    if (!Object.values(TYPES).includes(data.type)) {
      return;
    }

    switch (data.type) {
      case TYPES.init:
        this.#isBridgeReady = true;
        this.#subject.emit(data);
        break;
      case TYPES.res:
        this.#subject.emit(data);
        break;
      default:
        break;
    }
  }
}
