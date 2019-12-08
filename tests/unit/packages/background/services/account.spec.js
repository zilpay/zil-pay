import 'tests/extension-sinnon'

// import { generateMnemonic } from 'bip39'

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
