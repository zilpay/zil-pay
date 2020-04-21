/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import Handler from './handler'
import { ZilPay } from './zil-pay'

const { window } = global

// Create handler stream.
const handler = new Handler()
// Init ZilPay object with some methods and properties.
const zilPay = new ZilPay(handler.subjectStream, handler.stream)

// Request for state(network, accounts).
handler.initialized()

// Nobody can change this object.
Object.freeze(zilPay)
// Init zilPay in some tab.
window.zilPay = zilPay
