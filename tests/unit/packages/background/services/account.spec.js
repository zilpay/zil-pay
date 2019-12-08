/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import 'tests/extension-sinnon'

// import { generateMnemonic } from 'bip39'
// import uuidv4 from 'uuid/v4'
// import { FIELDS } from 'config'

import { AccountControl } from '../../../../../packages/background/services/account'

// const SEED = generateMnemonic(128)

describe('packages:background:services:AccountControl', () => {
  let accountControl = null

  it('Should be import AccountControl class', () => {
    expect(AccountControl).toBeTruthy()
  })

  it('Should be able init AccountControl', () => {
    accountControl = new AccountControl()

    expect(accountControl).toBeTruthy()
  })

  // it('Should be able init wallet', () => {
  //   accountControl
  //     .initWallet(SEED)
  //     .then(console.log)

  //   expect(accountControl).toBeTruthy()
  // })

})
