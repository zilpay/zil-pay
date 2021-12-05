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
  readonly #delay = 1;
  #currentBlock = 0;

  public get blocknumber() {
    return this.#currentBlock;
  }

  public get name() {
    return this.#name;
  }

  constructor(zilliqa: ZilliqaControl, queue: TransactionsQueue) {
    this.#zilliqa = zilliqa;
    this.#queue = queue;

    chrome.alarms.clear(this.name);
    Runtime.alarms.create(`${this.name}/0`, {
      delayInMinutes: this.#delay,
      periodInMinutes: this.#delay
    });

    setTimeout(() => {
      Runtime.alarms.create(`${this.name}/1`, {
        delayInMinutes: this.#delay,
        periodInMinutes: this.#delay
      });
    }, 30000);
  }

  public async trackBlockNumber() {
    const lastBalockNumber = this.#currentBlock;
    const result = await this.#zilliqa.getLatestTxBlock();
    const blockNumber = Number(result.header.BlockNum);

    if (lastBalockNumber === blockNumber) {
      return;
    }

    await this.#setBlock(blockNumber);

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
      console.error('BlockController.subscribe', err);
    }

    await this.#queue.checkProcessedTx();
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
