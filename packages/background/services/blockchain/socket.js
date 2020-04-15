import { Subject } from 'rxjs'
import { RPCMethod, HTTPProvider } from '@zilliqa-js/core'
import { SubscriptionBuilder, MessageType } from '@zilliqa-js/subscriptions'

import { NetworkControl } from 'packages/background/services/network'

const HALF_MINUTE = 10000

export class SocketControl {

  constructor(networkControl) {
    if (!(networkControl instanceof NetworkControl)) {
      throw new Error('networkControl must be instance of NetworkControl')
    }

    this._subscriptionBuilder = new SubscriptionBuilder()
    this._networkControl = networkControl
    this._running = false

    this.blockNumber = 0
    this.observer = new Subject()
  }

  async start() {
    if (this._running) {
      return null
    }

    try {
      await this._networkControl.netwrokSync()

      this._subscriber = this._subscriptionBuilder.buildNewBlockSubscriptions(
        this._networkControl.wsProvider
      )

      this._subscriber.emitter.on(MessageType.NEW_BLOCK, (event) => {
        if (isNaN(event.value.TxBlock.header.BlockNum)) {
          return null
        }

        this.blockNumber = Number(event.value.TxBlock.header.BlockNum)
        this.observer.next(this.blockNumber)
      })

      this._subscriber.emitter.on(MessageType.UNSUBSCRIBE, (event) => {
        this._running = false
      })

      await this._subscriber.start()
    } catch (err) {
      this._pollingInterval()
    } finally {
      this._running = true
    }
  }

  async stop() {
    if (!this._running) {
      return null
    }

    try {
      await this._subscriber.stop()
      this._subscriber.removeAllSocketListeners()
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

  async _getBlockchainInfo() {
    const provider = new HTTPProvider(this._networkControl.provider)
    const method = RPCMethod.GetBlockchainInfo
    const { result } = await provider.send(method, [])
    const newBlockNumber = Number(result.CurrentMiniEpoch)

    if (this.blockNumber === newBlockNumber) {
      return null
    }

    this.blockNumber = newBlockNumber
    this.observer.next(this.blockNumber)
  }
}
