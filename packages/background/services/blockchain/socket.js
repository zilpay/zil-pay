import { Subject } from 'rxjs'
import { RPCMethod } from '@zilliqa-js/core/dist/net'
import { HTTPProvider } from '@zilliqa-js/core/dist/providers/http'

import { NetworkControl } from 'packages/background/services/network'

const HALF_MINUTE = 20000

export class SocketControl {

  constructor(networkControl) {
    if (!(networkControl instanceof NetworkControl)) {
      throw new Error('networkControl must be instance of NetworkControl')
    }

    this._networkControl = networkControl
    this._running = false

    this.blockNumber = 0
    this.observer = new Subject()
  }

  async start() {
    if (this._running) {
      return null
    }

    await this._networkControl.netwrokSync()

    this._pollingInterval()
    this._running = true
  }

  async stop() {
    if (!this._running) {
      return null
    }

    try {
      this._subscriber.unsubscribe()
      await this._subscriber.stop()
      this._subscriber.removeAllSocketListeners()
      this._subscriber.removeEventListener()
      this._subscriber.websocket.close()
    } catch (err) {
      //
    }

    try {
      clearInterval(this._interval)
    } catch (err) {
      //
    }

    this._running = false
  }

  _pollingInterval() {
    this._getBlockchainInfo()
    this._interval = setInterval(
      () => this._getBlockchainInfo(), HALF_MINUTE
    )
  }

  async _getRecentTransactions() {
    const provider = new HTTPProvider(this._networkControl.provider)
    const method = RPCMethod.GetRecentTransactions
    const { result } = await provider.send(method, [])

    return result.TxnHashes
  }

  async _getBlockchainInfo() {
    await this._networkControl.netwrokSync()

    const provider = new HTTPProvider(this._networkControl.provider)
    const method = RPCMethod.GetLatestTxBlock

    try {
      const { result } = await provider.send(method)
      const newBlockNumber = Number(result.header.BlockNum)

      if (this.blockNumber === newBlockNumber) {
        return null
      }

      const lastRecentTransactions = await this._getRecentTransactions()

      this.blockNumber = newBlockNumber
      this.observer.next({
        TxBlock: result,
        TxHashes: [lastRecentTransactions]
      })
      this._networkControl.status = true
      this._networkControl.updateBlockNumber(result.header.BlockNum)
    } catch (err) {
      this._networkControl.status = false
      this.stop()
    }
  }
}
