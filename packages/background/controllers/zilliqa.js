/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { FIELDS } from 'config'
import { BrowserStorage, BuildObject } from 'lib/storage'
import { TypeChecker } from 'lib/type'
import { accountControl, networkControl } from './main'
import { ZilliqaControl } from 'packages/background/services'
import { ERROR_MSGS } from 'packages/background/errors'

const { Promise } = global

export class Zilliqa {

  /**
   * Call when inpage script has been loaded.
   * @param {Function} sendResponse - CallBack funtion for return response to sender.
   * @param {String} domain - Tab domain name.
   */
  static async initInpage(sendResponse, domain) {
    await networkControl.netwrokSync()

    const storage = new BrowserStorage()
    const provider = networkControl.provider
    const isConnect = await accountControl.isConnection(domain)
    let wallet = await storage.get(FIELDS.WALLET)
    let account = null

    if (wallet && new TypeChecker(wallet.identities).isArray && isConnect) {
      account = wallet.identities[
        wallet.selectedAddress
      ]
    }

    const data = {
      provider,
      account,
      isConnect,
      isEnable: accountControl.auth.isEnable,
      net: networkControl.selected
    }

    sendResponse(data)
  }

  /**
   * Clear stored tx.
   * @param {Function} sendResponse - CallBack funtion for return response to sender.
   */
  static async rmAllTransactionList(sendResponse) {
    await accountControl.zilliqa.rmAllTransactionList()

    if (new TypeChecker(sendResponse).isFunction) {
      sendResponse(true)
    }
  }

  constructor(payload) {
    this.payload = payload
  }

  /**
   * Get some ZRC token informations.
   * @param {Function} sendResponse - CallBack funtion for return response to sender.
   */
  async getZRCTokenInfo(sendResponse) {
    await networkControl.netwrokSync()

    const storage = new BrowserStorage()
    const wallet = await storage.get(FIELDS.WALLET)
    const { address } = this.payload
    const account = wallet.identities[
      wallet.selectedAddress
    ]
    const token = {
      address,
      balance: '0'
    }
    const zilliqa = new ZilliqaControl(networkControl.provider)

    try {
      const { blockchain } = zilliqa
      const { result } = await blockchain.getSmartContractInit(address)

      for (let index = 0; index < result.length; index++) {
        const element = result[index]

        token[element.vname] = element.value
      }

      const totalSupplyResult = await blockchain
        .getSmartContractSubState(token.proxy_address, 'totalSupply')
      const balanceResult = await blockchain
        .getSmartContractSubState(token.proxy_address, 'balances', account.address)

      token.totalSupply = totalSupplyResult.result.totalSupply

      if (balanceResult.result && balanceResult.result.balances && balanceResult.result.balances[account.address]) {
        token.balance = balanceResult.result.balances[account.address]
      }
    } catch (err) {
      if (new TypeChecker(sendResponse).isFunction) {
        sendResponse({ reject: ERROR_MSGS.BAD_CONTRACT_ADDRESS })
      }

      return Promise.reject(err)
    }

    if (new TypeChecker(sendResponse).isFunction) {
      sendResponse({ resolve: token })
    }

    return Promise.resolve(token)
  }

  /**
   * Add to storage tokens info.
   * @param {Function} sendResponse - CallBack funtion for return response to sender.
   */
  async addZRCToken(sendResponse) {
    const storage = new BrowserStorage()
    const tokens = await storage.get([
      FIELDS.TOKENS,
      FIELDS.SELECTED_COIN
    ])
    const zrcToken = await this.getZRCTokenInfo()

    if (!tokens || !tokens[FIELDS.TOKENS]) {
      tokens[FIELDS.TOKENS] = []
    }

    tokens[FIELDS.SELECTED_COIN] = zrcToken.symbol
    tokens[FIELDS.TOKENS].push({
      ...zrcToken,
      address: zrcToken._this_address,
      _creation_block: undefined,
      _scilla_version: undefined,
      _this_address: undefined
    })

    await storage.set([
      new BuildObject(FIELDS.TOKENS, tokens[FIELDS.TOKENS]),
      new BuildObject(FIELDS.SELECTED_COIN, tokens[FIELDS.SELECTED_COIN])
    ])

    if (new TypeChecker(sendResponse).isFunction) {
      sendResponse({ resolve: tokens })
    }
  }

  async toDefaulTokens(sendResponse) {
    const data = await accountControl.initCoin()

    if (new TypeChecker(sendResponse).isFunction) {
      sendResponse({ resolve: data })
    }

    return data
  }

}
