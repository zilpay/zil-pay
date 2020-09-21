/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { v4 } from 'uuid'
import { Transaction } from 'packages/background/controllers/transaction'

describe('packages:controllers:Transaction', () => {
  it('Should import Transaction', () => {
    expect(Transaction).toBeTruthy()
  })

  it('try create instance', () => {
    expect(new Transaction()).toBeTruthy()
  })

  it('test constructor', () => {
    const payload = {
      uuid: v4()
    }
    const instance = new Transaction(payload)

    expect(instance.payload).toBeTruthy()
    expect(instance.payload.uuid).toEqual(payload.uuid)
  })

  it('should be have static methods', () => {
    expect(Transaction.returnTx).toBeTruthy()
    expect(Transaction.rmTransactionsConfirm).toBeTruthy()
    expect(Transaction.listingBlockchain).toBeTruthy()
  })

  it('should be have methods', () => {
    const instance = new Transaction({})

    expect(instance.checkAllTransaction).toBeTruthy()
    expect(instance.callTransaction).toBeTruthy()
    expect(instance.signSendTx).toBeTruthy()
    expect(instance.buildTxParams).toBeTruthy()
  })
})
