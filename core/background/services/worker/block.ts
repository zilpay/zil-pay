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

import { getManifestVersion, Runtime } from 'lib/runtime';
import { BrowserStorage, buildObject } from 'lib/storage';
import { Fields } from 'config/fields';
import { TabsMessage } from 'lib/streem/tabs-message';
import { MTypeTab } from 'lib/streem/stream-keys';
import { WORKER_POOLING } from "config/common";
import { ManifestVersions } from "config/manifest-versions";

export class BlockController {
  readonly #zilliqa: ZilliqaControl;
  readonly #queue: TransactionsQueue;
  readonly #name = `block/${Runtime.runtime.id}/zilpay`;
  readonly #delay = WORKER_POOLING;
  #currentBlock = 0;

  get delay() {
    return this.#delay;
  }

  public get blocknumber() {
    return this.#currentBlock;
  }

  public get name() {
    return this.#name;
  }

  constructor(zilliqa: ZilliqaControl, queue: TransactionsQueue) {
    this.#zilliqa = zilliqa;
    this.#queue = queue;
  }

  subscribe() {
    const alarmName = this.name;
    let intervalId: NodeJS.Timer;
    this.trackBlockNumber();

    if (getManifestVersion() === ManifestVersions.V2) {
      intervalId = globalThis.setInterval(() => {
        this.trackBlockNumber();
      }, this.delay);
    } else {
      Runtime.alarms.create(alarmName, {
        delayInMinutes: 0.16667,
        periodInMinutes: 0.16667
      });
      Runtime.alarms.onAlarm.addListener((alarm) => {
        if (alarm.name === alarmName) {
          this.trackBlockNumber();
        }
      });
    }

    return {
      unsubscribe() {
        if (intervalId !== undefined) {
          globalThis.clearInterval(Number(intervalId));
        } else {
          Runtime.alarms.clear(alarmName);
        }
      }
    }
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
      }).sendAll();
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
