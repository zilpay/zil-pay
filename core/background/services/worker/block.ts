/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */

import type { ZilliqaControl } from "core/background/services/blockchain";
import { Runtime } from 'lib/runtime';
import { BrowserStorage, buildObject } from 'lib/storage';
import { Fields } from 'config/fields';
import { TabsMessage } from 'lib/streem/tabs-message';
import { MTypeTab } from 'lib/streem/stream-keys';

export class BlockControl {
  private readonly _zilliqa: ZilliqaControl;
  private readonly _name = `block/${Runtime.runtime.id}/zilpay`;
  private readonly _delay = 0.3; // approximately 18seconds.
  private _currentBlock = 0;

  constructor(zilliqa: ZilliqaControl) {
    this._zilliqa = zilliqa;

    Runtime.alarms.clearAll();
    Runtime.alarms.create(this._name, {
      // delayInMinutes: this._delay,
      delayInMinutes: this._delay,
      periodInMinutes: this._delay
    });
  }

  public subscribe(cb?: (blocknumber: number) => void) {
    Runtime.alarms.onAlarm.addListener(async() => {
      const lastBalockNumber = this._currentBlock;
      const result = await this._zilliqa.getLatestTxBlock();
      const blockNumber = Number(result.header.BlockNum);

      if (lastBalockNumber === blockNumber) {
        return null;
      }

      await this._setBlock(blockNumber);

      if (cb) {
        cb(blockNumber);
      }

      const { TxnHashes } = await this._zilliqa.getRecentTransactions();
      const block = {
        TxBlock: result,
        TxHashes: [TxnHashes]
      };
      new TabsMessage({
        type: MTypeTab.NEW_BLOCK,
        payload: {
          block
        }
      }).send();
    });
  }

  public async sync() {
    const content = await BrowserStorage.get(Fields.BLOCK_NUMBER);
    const block = Number(content);

    if (isNaN(block)) {
      await BrowserStorage.set(
        buildObject(Fields.BLOCK_NUMBER, String(this._currentBlock))
      );

      return;
    }

    this._currentBlock = block;
  }

  private async _setBlock(block: number) {
    this._currentBlock = block;

    await BrowserStorage.set(
      buildObject(Fields.BLOCK_NUMBER, String(this._currentBlock))
    );
  }
}
