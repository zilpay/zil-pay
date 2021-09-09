/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import { NETWORK } from 'config/network';
import { Fields } from 'config/fields';
import { BrowserStorage, buildObject } from 'lib/storage';

const [mainnet] = Object.keys(NETWORK);

export class NetworkControl {
  public config = NETWORK;
  public selected = mainnet;

  get provider() {
    return this._getURL(this.selected);
  }

  get version() {
    return this.config[this.selected].MSG_VERSION;
  }

  public async sync() {
    const data = await BrowserStorage.get(
      Fields.CONFIG,
      Fields.SELECTED_NET  
    );

    if (!data) {
      await BrowserStorage.set(
        buildObject(Fields.CONFIG, this.config),
        buildObject(Fields.SELECTED_NET, this.selected)
      );
      return null;
    }

    if (data[Fields.CONFIG]) {
      this.config = data[Fields.CONFIG];
    }
    if (data[Fields.SELECTED_NET]) {
      this.selected = data[Fields.SELECTED_NET];
    }
  }

  /**
   * Change the network.
   * @param selected - Can be only (mainnet, testnet, private).
   */
  public async changeNetwork(selected: string) {
    const keys = Object.keys(NETWORK);

    if (!keys.includes(selected)) {
      throw new Error(`${selected} is not ${keys}`);
    } else if (selected === this.selected) {
      return {
        selected,
        config: this.config,
        provider: this.provider
      };
    }

    await BrowserStorage.set(
      buildObject(Fields.SELECTED_NET, selected)
    );

    this.selected = selected

    return {
      selected,
      config: this.config,
      provider: this.provider
    };
  }

  /**
   * Change Zilliqa network config.
   */
  public async changeConfig(config: typeof NETWORK) {
    await BrowserStorage.set(
      buildObject(Fields.CONFIG, config)
    );

    this.config = config;
  }

  public async updateBlockNumber(blockNumber: string | number) {
    await BrowserStorage.set(
      buildObject(Fields.BLOCK_NUMBER, String(blockNumber))
    );
  }

  private _getURL(selected: string) {
    return this.config[selected].PROVIDER;
  }
}
