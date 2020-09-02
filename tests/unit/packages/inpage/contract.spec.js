import { v4 as uuid } from 'uuid'
import { ContractControl, Contract } from 'packages/inpage/contract'
import Wallet from 'packages/inpage/wallet'
import Handler from 'packages/inpage/handler'
import { TransactionFactory } from 'packages/inpage/transaction'
import {
  InstanceError,
  ArgumentError,
  ERROR_MSGS,
  FormatError
} from 'packages/inpage/errors'
import { HTTPProviderTest } from './test-provider'

const TEST_CONTRACT_ADDRESS = 'zil1az5e0c6e4s4pazgahhmlca2cvgamp6kjtaxf4q'

class Wrong {}

const handler = new Handler()
const provider = new HTTPProviderTest()
const wallet = new Wallet(handler.subjectStream, handler.stream)
const transactions = new TransactionFactory(provider, wallet)
const wrongIntance = new Wrong()

let contractControlInstance = null
let contractInstance = null

describe('lib:packages:inpage:Contract', () => {

  it('Should can import Contract', () => {
    expect(Contract).toBeTruthy()
  })

  it('Should can import ContractControl', () => {
    expect(ContractControl).toBeTruthy()
  })

  it('Should can init ContractControl', () => {
    contractControlInstance = new ContractControl(transactions)

    expect(contractControlInstance).toBeTruthy()

    try {
      new ContractControl(wrongIntance)
    } catch (err) {
      expect(err).toEqual(new InstanceError('transactions', TransactionFactory))
    }
  })

  it('Should can init Contract', () => {
    contractInstance = new Contract(transactions, TEST_CONTRACT_ADDRESS, uuid(), {})

    expect(contractInstance).toBeTruthy()
  })

  it('Contract should have got properties', () => {
    expect(contractInstance._contractAddress).toBeTruthy()
    expect(contractInstance.address).toBeTruthy()
    expect(contractInstance.call).toBeTruthy()
    expect(contractInstance.code).toBeTruthy()
    expect(contractInstance.deploy).toBeTruthy()
    expect(contractInstance.getCode).toBeTruthy()
    expect(contractInstance.getInit).toBeTruthy()
    expect(contractInstance.getState).toBeTruthy()
    expect(contractInstance.getSubState).toBeTruthy()
    expect(contractInstance.init).toBeTruthy()
    expect(contractInstance.transactions).toBeTruthy()
  })

  it('ContractControl should have got properties', () => {
    expect(contractControlInstance.at).toBeTruthy()
    expect(contractControlInstance.new).toBeTruthy()
    expect(contractControlInstance.transactions).toBeTruthy()
  })

  it('Should can at contract', () => {
    contractControlInstance = new ContractControl(transactions)

    const newContractIntance = contractControlInstance.at(TEST_CONTRACT_ADDRESS)

    expect(newContractIntance).toBeTruthy()
    expect(newContractIntance).toEqual(
      new Contract(transactions, TEST_CONTRACT_ADDRESS)
    )
  })

  it('Should can set new contract', () => {
    contractControlInstance = new ContractControl(transactions)

    const code = uuid()
    const init = {
      _tag: uuid(),
      params: [
        uuid(),
        uuid()
      ]
    }

    const newContractIntance = contractControlInstance.new(code, init)

    expect(newContractIntance).toBeTruthy()
    expect(newContractIntance).toEqual(
      new Contract(transactions, undefined, code, init)
    )
  })

  it('Should throw error when deploy none code and none init', async() => {
    const zeroContract = new Contract(transactions)

    try {
      await zeroContract.deploy({})
    } catch (err) {
      expect(err).toEqual(new ArgumentError('code, init', ERROR_MSGS.INIT_PARAMS))
    }
  })

  it('has contract call some method', async() => {
    try {
      const zeroContract = new Contract(transactions)
      await zeroContract.call()
    } catch (err) {
      expect(err).toEqual(new ArgumentError('contract', ERROR_MSGS.CONTRACT_HASN_TDEPLOYED))
    }

    try {
      const zeroContract = new Contract(transactions, TEST_CONTRACT_ADDRESS)
      await zeroContract.call()
    } catch (err) {
      expect(err).toEqual(new ArgumentError('_tag', ERROR_MSGS.REQUIRED))
    }

    try {
      const zeroContract = new Contract(transactions, TEST_CONTRACT_ADDRESS)
      await zeroContract.call(2)
    } catch (err) {
      expect(err).toEqual(new FormatError('_tag'))
    }
  })

})
