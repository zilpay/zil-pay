/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { FIELDS, ZILLIQA } from 'config'
import { BrowserStorage, BuildObject } from 'lib/storage'
import { ArgumentError } from 'packages/background/errors'

const defaultSelected = Object.keys(ZILLIQA)[0]

export class NetworkControl {

  static mainnet = defaultSelected

  /**
   * @return nodeURL.
   */
  get provider() {
    return this._getURL(this.selected)
  }

  /**
   * Get WS provider.
   */
  get wsProvider() {
    const ws = this.config[this.selected].WS

    if (!ws) {
      return ZILLIQA[this.selected].WS
    }

    return ws
  }

  /**
   * @return Number, blockchain version.
   */
  get version() {
    return this.config[this.selected].MSG_VERSION
  }

  constructor(config = ZILLIQA, selected = defaultSelected) {
    this.config = config
    this.selected = selected
    this.status = null
    this._storage = new BrowserStorage()
  }

  _getURL(selected) {
    return this.config[selected].PROVIDER
  }

  /**
   * Change the network.
   * @param {String} selected - Can be only (mainnet, testnet, private).
   */
  async changeNetwork(selected) {
    if (!(selected in this.config)) {
      throw new ArgumentError('selected', `${selected} is not ${Object.keys(this.config)}`)
    } else if (selected === this.selected) {
      return {
        selected,
        config: this.config,
        provider: this.provider
      }
    }

    await this._storage.set(
      new BuildObject(FIELDS.SELECTED_NET, selected)
    )

    this.selected = selected

    return {
      selected,
      config: this.config,
      provider: this.provider
    }
  }

  /**
   * Change Zilliqa network config.
   * @param {Object} config - Zilliqa config object.
   */
  async changeConfig(config) {
    if (!config) {
      throw new ArgumentError('config')
    }

    await this._storage.set(
      new BuildObject(FIELDS.CONFIG, config)
    )

    this.config = {
      ...ZILLIQA,
      ...config
    }

    return this.config
  }

  /**
   * Synchronize with storage.
   */
  async netwrokSync() {
    const { config, selectednet } = await this._storage.get([
      FIELDS.SELECTED_NET,
      FIELDS.CONFIG
    ])

    if (config) {
      this.config = config
    }

    if (selectednet) {
      this.selected = selectednet
    }

    return {
      config,
      selected: this.selected
    }
  }

  async updateBlockNumber(blockNumber) {
    await this._storage.set(
      new BuildObject(FIELDS.BLOCK_NUMBER, blockNumber)
    )
  }

}
