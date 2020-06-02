import { BN, Long } from '@zilliqa-js/util/dist/index'
import { CryptoUtils } from 'packages/inpage/crypto'
import { Transaction, TransactionFactory } from 'packages/inpage/transaction'
import {
  ERROR_MSGS,
  AccessError,
  InstanceError
} from 'packages/inpage/errors'
import { HTTPProviderTest } from './test-provider'
import Wallet from 'packages/inpage/wallet'
import Handler from 'packages/inpage/handler'
import HTTPProvider from 'packages/inpage/provider'

const TEST_TX = {
  amount: '0',
  gasPrice: '1000000000',
  gasLimit: '40000',
  code: '',
  // eslint-disable-next-line max-len
  data: '{"_tag":"withdraw","params":[{"vname":"txId","type":"String","value":"1c549344-e584-486e-923d-d653d10c41d6"},{"vname":"to","type":"String","value":"zil1cmmrr2sg6nhtme23pkpfde8kh7jml4vmngpy0n"},{"vname":"amount","type":"String","value":"50000000000000"},{"vname":"signatures","type":"List (ByStr64)","value":["0x48a7ffdb6988fc9f4cd5ddf4ad7a762e3daf278b3df4916c2eb613548e6dd69167320437c2f08955bb37b558ec37f6ecd274d60db6c3bc171a6b1b902eaf2b04","0xeef0dc9a715ab8daf98862e96f82ee9dcfa8f87b13537a4aea9957c12c87e7c85c1437338adc634f12690992edfad0f603e17cf307d47739f593c7a88e2eee63"]}]}',
  nonce: 41,
  toAddr: '460585559ae70af1eaa5dcfff3feee640850acb8',
  version: '21823489',
  // eslint-disable-next-line max-len
  signature: '0x64A41B648B2FEE56DD7EA9759825C7FBA1C710CD5D1395D6405607AE571D08B94D0FBE7089DC2EBC7B08C5BADC80601543E3852F0564E49E5D9B0CF91EB0DD18'
}

class Wrong { }

const handler = new Handler()
const provider = new HTTPProviderTest()
const wallet = new Wallet(handler.subjectStream, handler.stream)
const wrongIntance = new Wrong()

describe('lib:packages:inpage:crypto', () => {

  it('Should can import Transaction', () => {
    expect(Transaction).toBeTruthy()
  })

  it('Should can import TransactionFactory', () => {
    expect(TransactionFactory).toBeTruthy()
  })

  it('Try to init TransactionFactory', () => {
    expect(new TransactionFactory(provider, wallet)).toBeTruthy()

    try {
      new TransactionFactory(wrongIntance, wallet)
    } catch (err) {
      expect(err).toEqual(new InstanceError('provider', HTTPProvider))
    }

    try {
      new TransactionFactory(provider, wrongIntance)
    } catch (err) {
      expect(err).toEqual(new InstanceError('wallet', Wallet))
    }
  })

  it('should be methods', () => {
    const factory = new TransactionFactory(provider, wallet)

    expect(factory.new).toBeTruthy()
    expect(factory.new).toBeInstanceOf(Function)
    expect(factory.payment).toBeTruthy()
    expect(factory.payment).toBeInstanceOf(Function)
  })

  it('should be disabled methods', () => {
    const factory = new TransactionFactory(provider, wallet)

    try {
      factory.payment()
    } catch (err) {
      expect(err).toEqual(new AccessError(ERROR_MSGS.DISABLE_DMETHOD))
    }
  })

  it('TransactionFactory call new method', () => {
    const factory = new TransactionFactory(provider, wallet)
    const tx = factory.new(TEST_TX)

    expect(tx).toBeTruthy()
    expect(tx).toBeInstanceOf(Transaction)
    expect(tx.payload).toEqual(TEST_TX)
    expect(tx).toEqual(new Transaction(TEST_TX))
  })

  it('Test Transaction parse tx params', () => {
    const tx = new Transaction(TEST_TX)

    expect(tx.version).toBe(TEST_TX.version)
    expect(tx.gasPrice).toBeInstanceOf(BN)
    expect(tx.gasLimit).toBeInstanceOf(Long)
    expect(tx.data).toEqual(JSON.parse(TEST_TX.data))
    expect(tx.code).toBe(TEST_TX.code)
    expect(tx.signature).toBe(TEST_TX.signature)
    expect(tx.nonce).toBe(TEST_TX.nonce)
    expect(tx.ID).toBeUndefined()
    expect(tx.TranID).toBeUndefined()
    expect(tx.toAddr).toBe(new CryptoUtils().toBech32Address(TEST_TX.toAddr))
  })

})
