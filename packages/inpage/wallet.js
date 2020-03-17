/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import uuidv4 from 'uuid/v4'
import { filter, take, map } from 'rxjs/operators'
import { from } from 'rxjs'

import { TypeChecker } from 'lib/type'
import {
  SecureMessage,
  MTypeTabContent,
  MTypeTab
} from 'lib/stream'

import { getFavicon, toAccountFormat } from './utils'

const { window, Promise } = global

// Private variables. //
let _stream = null // Stream instance.
let _subject = null // Listener instance.
let _defaultAccount = null
let _isConnect = false
let _isEnable = false
let _net = null
let _broadcastingTransaction = false
// Private variables. //


export default class Wallet {

  get isConnect() {
    return _isConnect
  }

  get isEnable() {
    return _isEnable
  }

  get net() {
    return _net
  }

  get defaultAccount() {
    return _defaultAccount
  }

  get broadcasting() {
    return _broadcastingTransaction
  }

  set broadcasting(value) {
    if (!new TypeChecker(value).isBoolean) {
      throw new Error('value must be boolean type')
    }

    _broadcastingTransaction = value
  }

  constructor(subjectStream, stream) {
    _stream = stream
    _subject = subjectStream

    _subject.subscribe(msg => {
      switch (msg.type) {

      case MTypeTab.ADDRESS_CHANGED:
        if (_isEnable && msg.payload.address) {
          _defaultAccount = toAccountFormat(msg.payload.address)
        }
        break

      case MTypeTab.GET_WALLET_DATA:
        _isConnect = msg.payload.isConnect
        _isEnable = msg.payload.isEnable
        _net = msg.payload.net
        if (_isEnable && msg.payload.account && msg.payload.account.address) {
          _defaultAccount = toAccountFormat(msg.payload.account.address)
        }
        break

      case MTypeTab.LOCK_STAUS:
        _isEnable = msg.payload.isEnable
        if (_isEnable && msg.payload.account && msg.payload.account.address) {
          _defaultAccount = toAccountFormat(msg.payload.account.address)
        }
        break

      case MTypeTab.NETWORK_CHANGED:
        _net = msg.payload.net
        break

      default:
        break
      }
    })
  }

  /**
   * Subscribe on all account change.
   */
  observableAccount() {
    if (!this.isConnect) {
      throw new Error('ZilPay is\'t connection to dApp')
    }

    let lastAccount = null

    return from(_subject).pipe(
      map(msg => {
        if (lastAccount === null || !_isEnable || !_isConnect) {
          return _defaultAccount
        }

        if (msg.type === MTypeTab.GET_WALLET_DATA || msg.type === MTypeTab.LOCK_STAUS) {
          _defaultAccount = toAccountFormat(msg.payload.account.address)
        } else if (msg.type === MTypeTab.ADDRESS_CHANGED) {
          _defaultAccount = toAccountFormat(msg.payload.address)
        }

        return _defaultAccount
      }),
      filter(account => account && lastAccount !== account.base16),
      map(account => {
        lastAccount = account.base16
        return account
      })
    )
  }

  /**
   * Subscribe on all network change.
   */
  observableNetwork() {
    return from(_subject).pipe(
      filter(msg => msg && (msg.type === MTypeTab.NETWORK_CHANGED || msg.type === MTypeTab.GET_WALLET_DATA)),
      map(msg => msg.payload.net)
    )
  }

  /**
   * Call popup for confirm Transaction.
   */
  sign(tx) {
    if (!this.isEnable) {
      throw new Error('ZilPay is disabled.')
    } else if (!this.isConnect) {
      throw new Error('User is\'t connections.')
    }

    const type = MTypeTab.CALL_TO_SIGN_TX
    const recipient = MTypeTabContent.CONTENT
    const uuid = uuidv4()
    let { payload } = tx

    // Transaction id.
    payload.uuid = uuid
    // Current tab title.
    payload.title = window.document.title
    // Url on favicon by current tab.
    payload.icon = getFavicon()
    // if true then ZilPay will not send to blockchain this tx.
    payload.isBroadcast = _broadcastingTransaction

    // Send transaction to content.js > background.js.
    new SecureMessage({ type, payload }).send(_stream, recipient)

    tx.confirm = () => from(_subject).pipe(
      // Waiting an answer by uuid.
      filter(res => res.type === MTypeTab.TX_RESULT),
      map(res => res.payload),
      filter(res => res.uuid && res.uuid === uuid),
      map(res => {
        if (res.reject) {
          throw res.reject
        } else if (res.resolve) {
          return Object.assign(tx, res.resolve)
        }
      }),
      take(1)
    ).toPromise()

    return tx
  }

  /**
   * Call popup for the get access from user.
   * this method need for show user info such as your address.
   */
  async connect() {
    const type = MTypeTab.CONNECT_APP
    const recipient = MTypeTabContent.CONTENT
    const uuid = uuidv4()
    const title = window.document.title
    const domain = window.document.domain
    const icon = getFavicon()
    const payload = { title, domain, icon, uuid }

    if (this.isConnect) {
      return Promise.resolve(this.isConnect)
    }

    new SecureMessage({ type, payload }).send(_stream, recipient)

    const confirmPayload = await from(_subject).pipe(
      filter(msg => msg.type === MTypeTab.CONNECT_APP),
      map(res => res.payload),
      filter(res => res.uuid && res.uuid === uuid),
      take(1)
    ).toPromise()

    _isConnect = confirmPayload.isConfirm
    _defaultAccount = toAccountFormat(confirmPayload.account.address)

    return confirmPayload.isConfirm
  }

}
