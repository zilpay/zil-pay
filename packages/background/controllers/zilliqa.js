/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import {
  FIELDS,
  DEFAULT_TOKEN,
  DEFAULT_TOKENS_LIST,
  ZIL_SWAP_CONTRACTS
} from 'config'
import { BrowserStorage, BuildObject } from 'lib/storage'
import { TypeChecker } from 'lib/type'
import { accountControl, networkControl } from './main'
import { ZilliqaControl } from 'packages/background/services'
import { ERROR_MSGS } from 'packages/background/errors'
import Big from 'big.js'

const { Promise } = global

Big.PE = 99

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

  /**
   * Creating Default tokens list.
   */
  static async addDefaultTokens() {
    const networks = Object.keys(DEFAULT_TOKENS_LIST)
    const storage = new BrowserStorage()
    let data = await storage.get([
      FIELDS.TOKENS,
      FIELDS.SELECTED_COIN,
      FIELDS.WALLET
    ])

    // Need wallet for balance check.
    if (!data[FIELDS.WALLET]) {
      return null
    }

    if (!data.tokens) {
      data = await accountControl.initCoin()
    }

    for (let index = 0; index < networks.length; index++) {
      const net = networks[index]
      const tokenAddresses = DEFAULT_TOKENS_LIST[net]

      for (let index = 0; index < tokenAddresses.length; index++) {
        const address = tokenAddresses[index]
        const payload = {
          address,
          defaultToken: true
        }
        const hasAddress = data.tokens[net].some((token) => token.address)

        if (hasAddress) {
          continue
        }

        try {
          await new Zilliqa(payload).addZRCToken()
          await storage.set(
            new BuildObject(FIELDS.SELECTED_COIN, DEFAULT_TOKEN.symbol)
          )
        } catch (err) {
          continue
        }
      }
    }
  }

  constructor(payload) {
    this.payload = payload
    this._storage = new BrowserStorage()
  }

  /**
   * Get some ZRC token informations.
   * @param {Function} sendResponse - CallBack funtion for return response to sender.
   */
  async getZRCTokenInfo(sendResponse) {
    await networkControl.netwrokSync()

    const wallet = await this._storage.get(FIELDS.WALLET)
    const { address, defaultToken } = this.payload
    const account = wallet.identities[
      wallet.selectedAddress
    ]
    const zilliqa = new ZilliqaControl(networkControl.provider)

    // Trting to get full token information.
    try {
      let result = await zilliqa.getSmartContractInit(address)

      if (result.proxy_address) {
        // If token is Mintable type need to get the operator.
        result = await zilliqa.getSmartContractInit(result.proxy_address)
      }

      // Getting total supply of token.
      const { total_supply } = await zilliqa.getSmartContractSubState(
        result._this_address, 'total_supply'
      )
      // Getting balance of token for current selected account.
      const balance = await zilliqa.getZRCBalance(result._this_address, account)
      const token = {
        address: result._this_address,
        balance: balance,
        owner: result.contract_owner,
        decimals: result.decimals,
        name: result.name,
        symbol: result.symbol,
        totalSupply: total_supply,
        default: Boolean(defaultToken)
      }

      if (new TypeChecker(sendResponse).isFunction) {
        sendResponse({ resolve: token })
      }

      return Promise.resolve(token)
    } catch (err) {
      if (new TypeChecker(sendResponse).isFunction) {
        sendResponse({ reject: ERROR_MSGS.BAD_CONTRACT_ADDRESS })
      }

      return Promise.reject(err)
    }
  }

  /**
   * Add to storage tokens info.
   * @param {Function} sendResponse - CallBack funtion for return response to sender.
   */
  async addZRCToken(sendResponse) {
    await networkControl.netwrokSync()
    const tokens = await this._storage.get([
      FIELDS.TOKENS,
      FIELDS.SELECTED_COIN
    ])
    const zrcToken = await this.getZRCTokenInfo()
    const selectedNet = networkControl.selected

    if (!tokens || !tokens[FIELDS.TOKENS]) {
      const keys = Object.keys(networkControl.config)

      tokens[FIELDS.TOKENS] = {
        [keys[0]]: [],
        [keys[1]]: [],
        [keys[2]]: []
      }
    }

    const hasToken = tokens[FIELDS.TOKENS][selectedNet].some(
      (t) => t.symbol === zrcToken.symbol
    )

    if (hasToken) {
      if (new TypeChecker(sendResponse).isFunction) {
        sendResponse({ reject: ERROR_MSGS.UNIQUE })
      }

      return Promise.reject(new Error(ERROR_MSGS.UNIQUE))
    }

    tokens[FIELDS.SELECTED_COIN] = zrcToken.symbol
    tokens[FIELDS.TOKENS][selectedNet].push(zrcToken)

    await this._storage.set([
      new BuildObject(FIELDS.TOKENS, tokens[FIELDS.TOKENS]),
      new BuildObject(FIELDS.SELECTED_COIN, tokens[FIELDS.SELECTED_COIN])
    ])

    if (new TypeChecker(sendResponse).isFunction) {
      sendResponse({ resolve: tokens })
    }
  }

  /**
   * Reset or create token tracker in storage.
   * @param {Function} sendResponse - CallBack funtion for return response to sender.
   */
  async toDefaulTokens(sendResponse) {
    await Zilliqa.addDefaultTokens()

    const tokens = await this._storage.get([
      FIELDS.TOKENS,
      FIELDS.SELECTED_COIN
    ])

    if (new TypeChecker(sendResponse).isFunction) {
      sendResponse({ resolve: tokens })
    }

    return tokens
  }

  /**
   * Remove token by symbol.
   * @param {Function} sendResponse - CallBack funtion for return response to sender.
   */
  async rmZRCToken(sendResponse) {
    const { symbol } = this.payload
    const tokens = await this._storage.get(FIELDS.TOKENS)
    const selectedNet = networkControl.selected

    if (symbol === DEFAULT_TOKEN.symbol) {
      sendResponse({
        resolve: {
          tokens,
          selectedcoin: DEFAULT_TOKEN.symbol
        }
      })
    }

    tokens[selectedNet] = tokens[selectedNet].filter((t) => t.symbol !== symbol)

    await this._storage.set([
      new BuildObject(FIELDS.TOKENS, tokens),
      new BuildObject(FIELDS.SELECTED_COIN, DEFAULT_TOKEN.symbol)
    ])

    sendResponse({
      resolve: {
        tokens: tokens,
        selectedcoin: DEFAULT_TOKEN.symbol
      }
    })
  }

  /**
   * Getting minimum gasPrice from blockchain.
   * @param {*} sendResponse - CallBack funtion for return response to sender.
   */
  async getMinGasPrice(sendResponse) {
    try {
      await networkControl.netwrokSync()

      const zilliqa = new ZilliqaControl(networkControl.provider)
      const { result, error } = await zilliqa.blockchain.getMinimumGasPrice()

      if (error) {
        throw new Error(error.message)
      }

      if (new TypeChecker(sendResponse).isFunction) {
        sendResponse({ resolve: result })
      }
    } catch (err) {
      if (new TypeChecker(sendResponse).isFunction) {
        sendResponse({ reject: err.message })
      }
    }
  }

  /**
   * Getting minimum gasPrice from blockchain.
   * @param {*} sendResponse - CallBack funtion for return response to sender.
   */
  async getZilSwapTokens(sendResponse) {
    try {
      await networkControl.netwrokSync()

      const fieldname = 'pools'
      const contract = ZIL_SWAP_CONTRACTS[networkControl.selected]
      const tokens = await this._storage.get(FIELDS.TOKENS)
      const zilliqa = new ZilliqaControl(networkControl.provider)
      const PromisePools = tokens[networkControl.selected].map(async(token) => {
        const pool = await zilliqa.getSmartContractSubState(contract, fieldname, [token.address])

        if (!pool || !pool[fieldname] || !pool[fieldname][token.address]) {
          return {
            symbol: token.symbol,
            zilReserve: '0',
            tokenReserve: '0',
            exchangeRate: '0'
          }
        }

        const [zilReserve, tokenReserve] = pool[fieldname][token.address].arguments
        const exchangeRate = String(Big(zilReserve).div(tokenReserve).toFixed(10))

        return {
          symbol: token.symbol,
          zilReserve,
          tokenReserve,
          exchangeRate
        }
      })
      const pools = await Promise.all(PromisePools)

      sendResponse({
        resolve: pools
      })
    } catch (err) {
      sendResponse({
        reject: err.message
      })
    }
  }
}
