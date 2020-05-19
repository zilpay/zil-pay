/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import 'tests/extension-sinnon'
import 'packages/inpage'

import { TypeChecker } from 'lib/type'

const { window } = global

const TEST_ADDRESS_BECH32 = 'zil1fmefrn4ajk45yv0t22czehcwyv02k4j6ew07pj'
const TESTE_ADDRESS_BASE16 = '0x4ef291cEbD95ab4231eB52b02Cdf0E231Eab565a'

describe('lib:packages:inpage', () => {

  it('should injected proxy object', () => {
    expect(window.zilPay).toBeTruthy()
  })

  it('should have provider object', () => {
    expect(window.zilPay.provider).toBeTruthy()
  })

  it('should have wallet object', () => {
    expect(window.zilPay.wallet).toBeTruthy()
  })

  it('should have observableAccount in wallet', () => {
    const { observableAccount } = window.zilPay.wallet

    expect(observableAccount).toBeTruthy()
    expect(new TypeChecker(observableAccount).isFunction).toBeTruthy()
  })

  it('should have observableNetwork in wallet', () => {
    const { observableNetwork } = window.zilPay.wallet

    expect(observableNetwork).toBeTruthy()
    expect(new TypeChecker(observableNetwork).isFunction).toBeTruthy()
  })

  it('should have observableTransaction in wallet', () => {
    const { observableTransaction } = window.zilPay.wallet

    expect(observableTransaction).toBeTruthy()
    expect(new TypeChecker(observableTransaction).isFunction).toBeTruthy()
  })

  it('should have observableBlock in wallet', () => {
    const { observableBlock } = window.zilPay.wallet

    expect(observableBlock).toBeTruthy()
    expect(new TypeChecker(observableBlock).isFunction).toBeTruthy()
  })

  it('should have addTransactionsQueue in wallet', () => {
    const { addTransactionsQueue } = window.zilPay.wallet

    expect(addTransactionsQueue).toBeTruthy()
    expect(new TypeChecker(addTransactionsQueue).isFunction).toBeTruthy()
  })

  it('should have connect in wallet', () => {
    const { connect } = window.zilPay.wallet

    expect(connect).toBeTruthy()
    expect(new TypeChecker(connect).isFunction).toBeTruthy()
  })

  it('should have blockchain object', () => {
    expect(window.zilPay.blockchain).toBeTruthy()
  })

  it('should have contracts object', () => {
    expect(window.zilPay.contracts).toBeTruthy()
  })

  it('should have transactions object', () => {
    expect(window.zilPay.transactions).toBeTruthy()
  })

  it('should have utils object', () => {
    expect(window.zilPay.utils).toBeTruthy()
  })

  it('should have crypto object', () => {
    expect(window.zilPay.crypto).toBeTruthy()
  })

  it('try decode bech32 address', () => {
    const base16 = window
      .zilPay
      .crypto
      .fromBech32Address(TEST_ADDRESS_BECH32)

    expect(base16).toEqual(TESTE_ADDRESS_BASE16)
  })

  it('try encode base16 to bech32 address', () => {
    const base16 = window
      .zilPay
      .crypto
      .toBech32Address(TESTE_ADDRESS_BASE16)

    expect(base16).toEqual(TEST_ADDRESS_BECH32)
  })
})
