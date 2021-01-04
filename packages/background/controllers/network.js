/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { networkControl, socketControl } from './main'
import { TabsMessage, MTypeTab } from 'lib/stream'
import { Transaction } from './transaction'
import { TypeChecker } from 'lib/type'
import { Zilliqa } from './zilliqa'
import { BrowserStorage, BuildObject } from 'lib/storage'
import { ZilliqaControl } from 'packages/background/services'
import { ZILLIQA, SSN_ADDRESS, FIELDS } from 'config'

const { PROVIDER } = ZILLIQA.mainnet
const { performance, Promise } = global
/**
 * Network actions for popup.
 */
export class Network {

  /**
   * @param {Object} payload - Message payload.
   */
  constructor(payload) {
    this.payload = payload
    this._storage = new BrowserStorage()
  }

  /**
   * When user change selected network through popup.
   * @param {Function} sendResponse - CallBack funtion for return response to sender.
   */
  async changeNetwork(sendResponse) {
    const { selectednet } = this.payload

    let payload = null
    const type = MTypeTab.NETWORK_CHANGED

    try {
      await networkControl.netwrokSync()
      await networkControl.changeNetwork(selectednet)
      await Zilliqa.addDefaultTokens()

      payload = {
        provider: networkControl.provider,
        net: networkControl.selected
      }

      sendResponse({ resolve: selectednet })

      new TabsMessage({ type, payload }).send()
      new Transaction().checkAllTransaction()
    } catch (err) {
      sendResponse({ reject: err.message })
    } finally {
      await socketControl.stop()
      await socketControl.start()
    }
  }

  async initSSn() {
    const ssn = await this._storage.get(FIELDS.SSN)

    if (!ssn) {
      await this.updateSSn()
    } else if (Array.isArray(ssn) && ssn.length === 0) {
      await this.updateSSn()
    }
  }

  /**
   * Gettgin ssnList from main node.
   * @param {Function} sendResponse - CallBack funtion for return response to sender.
   */
  async updateSSn(sendResponse) {
    const zilliqa = new ZilliqaControl(PROVIDER)
    const field = 'ssnlist'

    try {
      const res = await zilliqa.getSmartContractSubState(SSN_ADDRESS, field)
      const ssnlist = res[field]
      const list = Object.keys(ssnlist).map((addr) => ({
        address: addr,
        name: ssnlist[addr].arguments[3],
        api: ssnlist[addr].arguments[5]
      }))
      const defaultSSn = {
        address: '',
        name: 'Main',
        api: PROVIDER,
        ok: true,
        id: 1,
        time: 0
      }
      const ssnList = [defaultSSn, ...list].map(async(ssn) => {
        const t0 = performance.now()
        try {
          const zilInstance = new ZilliqaControl(PROVIDER)
          const result = await zilInstance.getNetworkId()

          const id = Number(result)
          const t1 = performance.now()

          return {
            ...ssn,
            id,
            time: Math.floor(t1 - t0)
          }
        } catch {
          const t1 = performance.now()
          return {
            ...ssn,
            id: 0,
            time: Math.floor(t1 - t0)
          }
        }
      })
      const gotSSN = await Promise.all(ssnList)

      await this._storage.set(
        new BuildObject(FIELDS.SSN, gotSSN)
      )

      if (new TypeChecker(sendResponse).isFunction) {
        sendResponse({ resolve: gotSSN })
      }
    } catch (err) {
      if (new TypeChecker(sendResponse).isFunction) {
        sendResponse({ reject: err.message })
      }
    }
  }

}
