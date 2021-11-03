/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import assert from 'assert';
import { NETWORK, NETWORK_KEYS } from 'config/network';
import { Fields } from 'config/fields';
import { BrowserStorage, buildObject } from 'lib/storage';
import { ErrorMessages } from 'config/errors';

const [mainnet] = NETWORK_KEYS;

export class NetworkControl {
  public config = NETWORK;
  public selected = mainnet;

  constructor() {
  }

  get provider() {
    return this.#getURL(this.selected);
  }

  get nativeHttp() {
    return NETWORK[this.selected].PROVIDER;
  }

  get version() {
    return this.config[this.selected].MSG_VERSION;
  }

  public async sync() {
    const data = await BrowserStorage.get(
      Fields.CONFIG,
      Fields.SELECTED_NET  
    );

    try {
      if (data[Fields.SELECTED_NET]) {
        this.selected = data[Fields.SELECTED_NET];
      }

      if (data[Fields.CONFIG]) {
        this.config = JSON.parse(data[Fields.CONFIG]);
      }
    } catch {
      await BrowserStorage.set(
        buildObject(Fields.CONFIG, this.config),
        buildObject(Fields.SELECTED_NET, this.selected)
      );
    }
  }

  public async reset() {
    this.selected = mainnet;
    this.config = NETWORK;

    await BrowserStorage.set(
      buildObject(Fields.CONFIG, this.config),
      buildObject(Fields.SELECTED_NET, this.selected)
    );
  }

  /**
   * Change the network.
   * @param selected - Can be only (mainnet, testnet, private).
   */
  public async changeNetwork(selected: string) {
    const keys = Object.keys(NETWORK);

    assert(keys.includes(selected), ErrorMessages.IncorrectKey);

    if (selected === this.selected) {
      return {
        selected,
        config: this.config,
        provider: this.provider
      };
    }

    await BrowserStorage.set(
      buildObject(Fields.SELECTED_NET, selected)
    );

    this.selected = selected;

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

  #getURL(selected: string) {
    return this.config[selected].PROVIDER;
  }
}
