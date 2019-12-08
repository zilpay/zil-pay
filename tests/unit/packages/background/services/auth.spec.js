import 'tests/extension-sinnon'

// import { generateMnemonic } from 'bip39'

import { Auth } from '../../../../../packages/background/services/auth'

// const SEED = generateMnemonic(128)

describe('packages:background:services:Auth', () => {
  let authControl = null

  it('Should be import authControl class', () => {
    expect(Auth).toBeTruthy()
  })

  it('Should be able init authControl', () => {
    authControl = new Auth()

    expect(authControl).toBeTruthy()
  })

})
