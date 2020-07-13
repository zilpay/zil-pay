/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import 'tests/extension-sinnon'
import { generateMnemonic } from 'bip39'
import {
  toChecksumAddress,
  verifyPrivateKey,
  schnorr
} from '@zilliqa-js/crypto'
import { FIELDS } from 'config'

import { BrowserStorage } from 'lib/storage'
import { ZilliqaControl } from 'packages/background/services/blockchain'
import { NetworkControl } from 'packages/background/services/network'
import { uuid } from 'uuidv4'
import { AES } from 'lib/crypto'

const SEED = generateMnemonic(128)
const PRIVATE_KEY = schnorr.generatePrivateKey()

const browserStorage = new BrowserStorage()
const networkControl = new NetworkControl()
let zilliqaControl = null

describe('packages:background:services:blockchain:ZilliqaControl', () => {
  it('Should be import ZilliqaControl class', () => {
    expect(ZilliqaControl).toBeTruthy()
  })

  it('Should be able init ZilliqaControl class', () => {
    zilliqaControl = new ZilliqaControl(networkControl.provider)

    expect(zilliqaControl).toBeTruthy()
  })

  it('Should have got some methods', () => {
    zilliqaControl = new ZilliqaControl(networkControl.provider)

    expect(zilliqaControl.getBalance).toBeTruthy()
    expect(zilliqaControl.getPendingTxn).toBeTruthy()
    expect(zilliqaControl.getSmartContractSubState).toBeTruthy()
    expect(zilliqaControl.buildTxParams).toBeTruthy()
    expect(zilliqaControl.singTransaction).toBeTruthy()
    expect(zilliqaControl.signMessage).toBeTruthy()
    expect(zilliqaControl.version).toBeTruthy()
    expect(zilliqaControl.getAccountBySeed).toBeTruthy()
    expect(zilliqaControl.getAccountByPrivateKey).toBeTruthy()
    expect(zilliqaControl.addForSingTransaction).toBeTruthy()
    expect(zilliqaControl.addForSignMessage).toBeTruthy()
    expect(zilliqaControl.rmForSingTransaction).toBeTruthy()
    expect(zilliqaControl.addTransactionList).toBeTruthy()
    expect(zilliqaControl.updateTransactionList).toBeTruthy()
    expect(zilliqaControl.notificationsCounter).toBeTruthy()
  })

  it('test signMessage method', async() => {
    const index = 0
    const account = await zilliqaControl.getAccountBySeed(
      SEED, index
    )
    const message = uuid()
    const hashStr = new AES().hash(message)
    const hashBytes = Buffer.from(hashStr, 'hex')
    const signature0 = zilliqaControl.signMessage(message, account)

    expect(signature0.publicKey).toBeTruthy()
    expect(signature0.signature).toBeTruthy()

    const signature = schnorr.toSignature(signature0.signature)
    const verify = schnorr.verify(
      hashBytes,
      signature,
      Buffer.from(signature0.publicKey, 'hex')
    )

    expect(verify).toBeTruthy()
  })

  it('Should be able get account by seed words', async() => {
    const index = 0
    const account = await zilliqaControl.getAccountBySeed(
      SEED, index
    )

    expect(account).toBeTruthy()
    expect(account.index).toBe(0)
    expect(account.publicKey).toBeTruthy()
    expect(verifyPrivateKey(account.privateKey)).toBeTruthy()
    expect(toChecksumAddress(account.address)).toBeTruthy()
    expect(account.balance).not.toBeNull()
  })

  it('Should be able get account by PrivateKey', async() => {
    const index = 0
    const account = await zilliqaControl.getAccountByPrivateKey(
      PRIVATE_KEY, index
    )

    expect(account).toBeTruthy()
    expect(account.address).toBeTruthy()
    expect(account.index).toBe(0)
    expect(account.balance).not.toBeNull()
    expect(account.privateKey).toEqual(PRIVATE_KEY)
  })

  it('Should be able add transaction for confirm', async() => {
    const tx = {
      amount: '1239201312789',
      code: '',
      data: '',
      gasLimit: '123',
      gasPrice: '1000000000',
      toAddr: '0x1b9bEE83A721B6e63Ba4819D0c9ce2D16C521Bd3'
    }

    await zilliqaControl.addForSingTransaction(tx)

    const txForConfirm = await browserStorage.get(FIELDS.CONFIRM_TX)

    expect(txForConfirm).toBeTruthy()
    expect(txForConfirm[0]).toEqual(tx)
  })

  it('Should be able remove transaction for confirm', async() => {
    await zilliqaControl.rmForSingTransaction()

    const txForConfirm = await browserStorage.get(FIELDS.CONFIRM_TX)

    expect(txForConfirm).toBeTruthy()
    expect(txForConfirm).toEqual([])
  })

  it('Should be able add confirmed transaction', async() => {
    const tx = {
      Info: 'Contract Txn, Sent To Ds',
      TranID: 'd1c197340e834ede4c2203a4594316c47cf1961887a9bc6f8d804bd6adbccbcd',
      amount: '1000000000000',
      toAddr: '0x1b9bEE83A721B6e63Ba4819D0c9ce2D16C521Bd3',
      nonce: 106,
      from: '0xEEf22809B26479ce53F52A0849DbBDAd630E0F35'
    }

    await zilliqaControl.addTransactionList(tx, networkControl.selected)

    const txFromStorage = await browserStorage.get(FIELDS.TRANSACTIONS)

    expect(txFromStorage[tx.from]).toBeTruthy()
    expect(txFromStorage[tx.from][networkControl.selected]).toBeTruthy()
  })
})
