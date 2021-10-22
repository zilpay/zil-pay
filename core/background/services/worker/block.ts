/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */

import type { ZilliqaControl } from "core/background/services/blockchain";
import type { TransactionsQueue } from "core/background/services/transactions";
import type { TxBlock } from "types/block";

import { Runtime } from 'lib/runtime';
import { BrowserStorage, buildObject } from 'lib/storage';
import { Fields } from 'config/fields';
import { TabsMessage } from 'lib/streem/tabs-message';
import { MTypeTab } from 'lib/streem/stream-keys';

export class BlockController {
  readonly #zilliqa: ZilliqaControl;
  readonly #queue: TransactionsQueue;
  readonly #name = `block/${Runtime.runtime.id}/zilpay`;
  readonly #delay = 0.3; // approximately 18seconds.
  #currentBlock = 0;

  public get blocknumber() {
    return this.#currentBlock;
  }

  constructor(zilliqa: ZilliqaControl, queue: TransactionsQueue) {
    this.#zilliqa = zilliqa;
    this.#queue = queue;

    this.unsubscribe();
    Runtime.alarms.create(this.#name, {
      delayInMinutes: this.#delay,
      periodInMinutes: this.#delay
    });
  }

  public async subscribe(cb?: (blocknumber: number) => void) {
    await this.#queue.checkProcessedTx();

    Runtime.alarms.onAlarm.addListener(async() => {
      const lastBalockNumber = this.#currentBlock;
      const result = await this.#zilliqa.getLatestTxBlock();
      const blockNumber = Number(result.header.BlockNum);

      if (lastBalockNumber === blockNumber) {
        return null;
      }

      await this.#setBlock(blockNumber);

      if (cb) {
        cb(blockNumber);
      }

      try {
        const { TxnHashes } = await this.#zilliqa.getRecentTransactions();
        const block: TxBlock = {
          TxBlock: result,
          TxHashes: [TxnHashes]
        };
        new TabsMessage({
          type: MTypeTab.NEW_BLOCK,
          payload: {
            block
          }
        }).send();
      } catch (err) {
        // console.error('BlockController.subscribe', err);
      }

      await this.#queue.checkProcessedTx();
    });
  }

  public unsubscribe() {
    Runtime.alarms.clearAll();
  }

  public async sync() {
    const content = await BrowserStorage.get(Fields.BLOCK_NUMBER);
    const block = Number(content);

    if (isNaN(block)) {
      await BrowserStorage.set(
        buildObject(Fields.BLOCK_NUMBER, String(this.#currentBlock))
      );

      return;
    }

    this.#currentBlock = block;
  }

  async #setBlock(block: number) {
    this.#currentBlock = block;

    await BrowserStorage.set(
      buildObject(Fields.BLOCK_NUMBER, String(this.#currentBlock))
    );
  }
}
