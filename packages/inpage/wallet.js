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
  MTypeSecure,
  MTypeTab,
  MTypeInpage
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

      case MTypeTab.STATUS_UPDATE:
        _isEnable = msg.payload.isEnable
        break

      case MTypeInpage.INJECTED_INIT:
        this._setDefaultAccount(msg.payload.account)

        _isEnable = msg.payload.isEnable
        _isConnect = msg.payload.isConnect
        _net = msg.payload.net
        break

      case MTypeTab.SET_ADDRESS:
        this._setDefaultAccount(msg.payload)
        break

      case MTypeTab.SET_NET:
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
        if (lastAccount === null) {
          return _defaultAccount
        }

        switch (msg.type) {
        case MTypeInpage.INJECTED_INIT:
          return toAccountFormat(msg.payload.account.address)
        case MTypeTab.SET_ADDRESS:
          return toAccountFormat(msg.payload.address)
        }
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
      filter(msg => msg && msg.type === MTypeTab.SET_NET),
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

    const type = MTypeTab.CALL_SIGN_TX
    const recipient = MTypeSecure.CONTENT
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
    const recipient = MTypeTab.CONNECT_APP
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
    this._setDefaultAccount(confirmPayload.account)

    return confirmPayload.isConfirm
  }

  _setDefaultAccount(account) {
    if (!this.isEnable || !account || !this.isConnect) {
      return null
    } else if (_defaultAccount && account.address === _defaultAccount.base16) {
      return _defaultAccount
    }

    _defaultAccount = toAccountFormat(account.address)

    return _defaultAccount
  }

}
