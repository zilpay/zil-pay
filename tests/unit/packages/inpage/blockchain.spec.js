import { uuid } from 'uuidv4'
import { Blockchain } from '../../../../packages/inpage/blockchain'
import Wallet from 'packages/inpage/wallet'
import Handler from 'packages/inpage/handler'
import { CryptoUtils } from 'packages/inpage/crypto'
import { ShouldArrayError, ArgumentError, ERROR_MSGS } from 'packages/inpage/errors'

import { HTTPProviderTest } from './test-provider'

const TEST_ADDRESS_BECH32 = 'zil1fmefrn4ajk45yv0t22czehcwyv02k4j6ew07pj'
const TESTE_ADDRESS_BASE16 = '0x4ef291cEbD95ab4231eB52b02Cdf0E231Eab565a'
const TEST_ADDRESS_HEX = '4ef291cebd95ab4231eb52b02cdf0e231eab565a'
const TEST_HASH = '0xd781a0183a5dec3e5ed549591dfb8bc55021f28a073779fe89913f0d5800716d'
const TEST_CONTRACT_ADDRESS = 'zil1az5e0c6e4s4pazgahhmlca2cvgamp6kjtaxf4q'

const handler = new Handler()
const provider = new HTTPProviderTest()
const wallet = new Wallet(handler.subjectStream, handler.stream)
const blockchain = new Blockchain(provider, wallet)

describe('lib:packages:inpage:Blockchain', () => {

  it('Should can import', async() => {
    expect(Blockchain).toBeTruthy()
  })

  it('Should can send getBalance method', async() => {
    const rpcRequest0 = await blockchain.getBalance(TEST_ADDRESS_BECH32)
    const rpcRequest1 = await blockchain.getBalance(TESTE_ADDRESS_BASE16)
    const shouldBe = {
      id: 1,
      jsonrpc: '2.0',
      method: provider.RPCMethod.GetBalance,
      params: [TEST_ADDRESS_HEX]
    }

    expect(rpcRequest0).toEqual(shouldBe)
    expect(rpcRequest1).toEqual(shouldBe)

    try {
      await blockchain.getBalance()
    } catch (err) {
      expect(err).toEqual(new ArgumentError('addr', ERROR_MSGS.REQUIRED))
    }
  })

  it('Should can send getBlockChainInfo method', async() => {
    const rpcRequest = await blockchain.getBlockChainInfo()
    const shouldBe = {
      id: 1,
      jsonrpc: '2.0',
      method: provider.RPCMethod.GetBlockchainInfo,
      params: []
    }

    expect(rpcRequest).toEqual(shouldBe)
  })

  it('Should can send getContractAddressFromTransactionID method', async() => {
    const rpcRequest = await blockchain.getContractAddressFromTransactionID(TEST_HASH)
    const shouldBe = {
      id: 1,
      jsonrpc: '2.0',
      method: provider.RPCMethod.GetContractAddressFromTransactionID,
      params: [new CryptoUtils().toHex(TEST_HASH)]
    }

    expect(rpcRequest).toEqual(shouldBe)

    try {
      await blockchain.getContractAddressFromTransactionID()
    } catch (err) {
      expect(err).toEqual(new ArgumentError('hash', ERROR_MSGS.REQUIRED))
    }
  })

  it('Should can send getCurrentDSEpoch method', async() => {
    const rpcRequest = await blockchain.getCurrentDSEpoch()
    const shouldBe = {
      id: 1,
      jsonrpc: '2.0',
      method: provider.RPCMethod.GetCurrentDSEpoch,
      params: []
    }

    expect(rpcRequest).toEqual(shouldBe)
  })

  it('Should can send getCurrentMiniEpoch method', async() => {
    const rpcRequest = await blockchain.getCurrentMiniEpoch()
    const shouldBe = {
      id: 1,
      jsonrpc: '2.0',
      method: provider.RPCMethod.GetCurrentMiniEpoch,
      params: []
    }

    expect(rpcRequest).toEqual(shouldBe)
  })

  it('Should can send getDSBlock method', async() => {
    const value = 100
    const rpcRequest = await blockchain.getDSBlock(value)
    const shouldBe = {
      id: 1,
      jsonrpc: '2.0',
      method: provider.RPCMethod.GetDSBlock,
      params: [String(value)]
    }

    expect(rpcRequest).toEqual(shouldBe)

    try {
      await blockchain.getDSBlock()
    } catch (err) {
      expect(err).toEqual(new ArgumentError('blockNum', ERROR_MSGS.REQUIRED))
    }
  })

  it('Should can send getDSBlockListing method', async() => {
    const value = 10
    const rpcRequest = await blockchain.getDSBlockListing(value)
    const shouldBe = {
      id: 1,
      jsonrpc: '2.0',
      method: provider.RPCMethod.DSBlockListing,
      params: [String(value)]
    }

    expect(rpcRequest).toEqual(shouldBe)

    try {
      await blockchain.getDSBlockListing()
    } catch (err) {
      expect(err).toEqual(new ArgumentError('max', ERROR_MSGS.REQUIRED))
    }
  })

  it('Should can send getDSBlockRate method', async() => {
    const rpcRequest = await blockchain.getDSBlockRate()
    const shouldBe = {
      id: 1,
      jsonrpc: '2.0',
      method: provider.RPCMethod.GetDSBlockRate,
      params: []
    }

    expect(rpcRequest).toEqual(shouldBe)
  })

  it('Should can send getLatestDSBlock method', async() => {
    const rpcRequest = await blockchain.getLatestDSBlock()
    const shouldBe = {
      id: 1,
      jsonrpc: '2.0',
      method: provider.RPCMethod.GetLatestDSBlock,
      params: []
    }

    expect(rpcRequest).toEqual(shouldBe)
  })

  it('Should can send getLatestTxBlock method', async() => {
    const rpcRequest = await blockchain.getLatestTxBlock()
    const shouldBe = {
      id: 1,
      jsonrpc: '2.0',
      method: provider.RPCMethod.GetLatestTxBlock,
      params: []
    }

    expect(rpcRequest).toEqual(shouldBe)
  })

  it('Should can send getMinerInfo method', async() => {
    const dsBlockNumber = 100
    const rpcRequest = await blockchain.getMinerInfo(dsBlockNumber)
    const shouldBe = {
      id: 1,
      jsonrpc: '2.0',
      method: provider.RPCMethod.GetMinerInfo,
      params: [String(dsBlockNumber)]
    }

    expect(rpcRequest).toEqual(shouldBe)

    try {
      await blockchain.getMinerInfo()
    } catch (err) {
      expect(err).toEqual(new ArgumentError('dsBlockNumber', ERROR_MSGS.REQUIRED))
    }
  })

  it('Should can send getMinimumGasPrice method', async() => {
    const rpcRequest = await blockchain.getMinimumGasPrice()
    const shouldBe = {
      id: 1,
      jsonrpc: '2.0',
      method: provider.RPCMethod.GetMinimumGasPrice,
      params: []
    }

    expect(rpcRequest).toEqual(shouldBe)
  })

  it('Should can send getNumDSBlocks method', async() => {
    const rpcRequest = await blockchain.getNumDSBlocks()
    const shouldBe = {
      id: 1,
      jsonrpc: '2.0',
      method: provider.RPCMethod.GetNumDSBlocks,
      params: []
    }

    expect(rpcRequest).toEqual(shouldBe)
  })

  it('Should can send getNumTransactions method', async() => {
    const rpcRequest = await blockchain.getNumTransactions()
    const shouldBe = {
      id: 1,
      jsonrpc: '2.0',
      method: provider.RPCMethod.GetNumTransactions,
      params: []
    }

    expect(rpcRequest).toEqual(shouldBe)
  })

  it('Should can send getNumTxBlocks method', async() => {
    const rpcRequest = await blockchain.getNumTxBlocks()
    const shouldBe = {
      id: 1,
      jsonrpc: '2.0',
      method: provider.RPCMethod.GetNumTxBlocks,
      params: []
    }

    expect(rpcRequest).toEqual(shouldBe)
  })

  it('Should can send getNumTxnsDSEpoch method', async() => {
    const epoch = 100
    const rpcRequest = await blockchain.getNumTxnsDSEpoch(epoch)
    const shouldBe = {
      id: 1,
      jsonrpc: '2.0',
      method: provider.RPCMethod.GetNumTxnsDSEpoch,
      params: [String(epoch)]
    }

    expect(rpcRequest).toEqual(shouldBe)

    try {
      await blockchain.getNumTxnsDSEpoch()
    } catch (err) {
      expect(err).toEqual(new ArgumentError('epoch', ERROR_MSGS.REQUIRED))
    }
  })

  it('Should can send getNumTxnsTxEpoch method', async() => {
    const epoch = 100
    const rpcRequest = await blockchain.getNumTxnsTxEpoch(epoch)
    const shouldBe = {
      id: 1,
      jsonrpc: '2.0',
      method: provider.RPCMethod.GetNumTxnsTxEpoch,
      params: [String(epoch)]
    }

    expect(rpcRequest).toEqual(shouldBe)

    try {
      await blockchain.getNumTxnsTxEpoch()
    } catch (err) {
      expect(err).toEqual(new ArgumentError('epoch', ERROR_MSGS.REQUIRED))
    }
  })

  it('Should can send getPendingTxn method', async() => {
    const rpcRequest = await blockchain.getPendingTxn(TEST_HASH)
    const shouldBe = {
      id: 1,
      jsonrpc: '2.0',
      method: provider.RPCMethod.GetPendingTxn,
      params: [new CryptoUtils().toHex(TEST_HASH)]
    }

    expect(rpcRequest).toEqual(shouldBe)

    try {
      await blockchain.getPendingTxn()
    } catch (err) {
      expect(err).toEqual(new ArgumentError('hash', ERROR_MSGS.REQUIRED))
    }
  })

  it('Should can send getPendingTxns method', async() => {
    const rpcRequest = await blockchain.getPendingTxns()
    const shouldBe = {
      id: 1,
      jsonrpc: '2.0',
      method: provider.RPCMethod.GetPendingTxns,
      params: []
    }

    expect(rpcRequest).toEqual(shouldBe)
  })

  it('Should can send getPrevDSDifficulty method', async() => {
    const rpcRequest = await blockchain.getPrevDSDifficulty()
    const shouldBe = {
      id: 1,
      jsonrpc: '2.0',
      method: provider.RPCMethod.GetPrevDSDifficulty,
      params: []
    }

    expect(rpcRequest).toEqual(shouldBe)
  })

  it('Should can send getPrevDifficulty method', async() => {
    const rpcRequest = await blockchain.getPrevDifficulty()
    const shouldBe = {
      id: 1,
      jsonrpc: '2.0',
      method: provider.RPCMethod.GetPrevDifficulty,
      params: []
    }

    expect(rpcRequest).toEqual(shouldBe)
  })

  it('Should can send getPrevDifficulty method', async() => {
    const rpcRequest = await blockchain.getRecentTransactions()
    const shouldBe = {
      id: 1,
      jsonrpc: '2.0',
      method: provider.RPCMethod.GetRecentTransactions,
      params: []
    }

    expect(rpcRequest).toEqual(shouldBe)
  })

  it('Should can send getShardingStructure method', async() => {
    const rpcRequest = await blockchain.getShardingStructure()
    const shouldBe = {
      id: 1,
      jsonrpc: '2.0',
      method: provider.RPCMethod.GetShardingStructure,
      params: []
    }

    expect(rpcRequest).toEqual(shouldBe)
  })

  it('Should can send getSmartContractCode method', async() => {
    const rpcRequest = await blockchain.getSmartContractCode(TEST_CONTRACT_ADDRESS)
    const shouldBe = {
      id: 1,
      jsonrpc: '2.0',
      method: provider.RPCMethod.GetSmartContractCode,
      params: [new CryptoUtils().toHex(new CryptoUtils().normaliseAddress(TEST_CONTRACT_ADDRESS))]
    }

    expect(rpcRequest).toEqual(shouldBe)

    try {
      await blockchain.getSmartContractCode()
    } catch (err) {
      expect(err).toEqual(new ArgumentError('addr', ERROR_MSGS.REQUIRED))
    }
  })

  it('Should can send getSmartContractInit method', async() => {
    const rpcRequest = await blockchain.getSmartContractInit(TEST_CONTRACT_ADDRESS)
    const shouldBe = {
      id: 1,
      jsonrpc: '2.0',
      method: provider.RPCMethod.GetSmartContractInit,
      params: [new CryptoUtils().toHex(new CryptoUtils().normaliseAddress(TEST_CONTRACT_ADDRESS))]
    }

    expect(rpcRequest).toEqual(shouldBe)

    try {
      await blockchain.getSmartContractInit()
    } catch (err) {
      expect(err).toEqual(new ArgumentError('addr', ERROR_MSGS.REQUIRED))
    }
  })

  it('Should can send getSmartContractInit method', async() => {
    const rpcRequest = await blockchain.getSmartContractState(TEST_CONTRACT_ADDRESS)
    const shouldBe = {
      id: 1,
      jsonrpc: '2.0',
      method: provider.RPCMethod.GetSmartContractState,
      params: [new CryptoUtils().toHex(new CryptoUtils().normaliseAddress(TEST_CONTRACT_ADDRESS))]
    }

    expect(rpcRequest).toEqual(shouldBe)

    try {
      await blockchain.getSmartContractState()
    } catch (err) {
      expect(err).toEqual(new ArgumentError('addr', ERROR_MSGS.REQUIRED))
    }
  })

  it('Should can send getSmartContractSubState method', async() => {
    const indices = [uuid(), uuid(), uuid()]
    const variableName = uuid()
    const rpcRequest = await blockchain.getSmartContractSubState(
      TEST_CONTRACT_ADDRESS,
      variableName,
      indices
    )
    const shouldBe = {
      id: 1,
      jsonrpc: '2.0',
      method: provider.RPCMethod.GetSmartContractSubState,
      params: [
        new CryptoUtils().toHex(new CryptoUtils().normaliseAddress(TEST_CONTRACT_ADDRESS)),
        variableName,
        indices
      ]
    }

    expect(rpcRequest).toEqual(shouldBe)

    try {
      await blockchain.getSmartContractSubState()
    } catch (err) {
      expect(err).toEqual(new ArgumentError('addr', ERROR_MSGS.REQUIRED))
    }

    try {
      await blockchain.getSmartContractSubState(TEST_CONTRACT_ADDRESS)
    } catch (err) {
      expect(err).toEqual(new ArgumentError('variableName', ERROR_MSGS.REQUIRED))
    }

    try {
      await blockchain.getSmartContractSubState(
        TEST_CONTRACT_ADDRESS,
        variableName,
        ''
      )
    } catch (err) {
      expect(err).toEqual(new ShouldArrayError('indices'))
    }
  })

  it('Should can send getSmartContracts method', async() => {
    const rpcRequest = await blockchain.getSmartContracts(TEST_CONTRACT_ADDRESS)
    const shouldBe = {
      id: 1,
      jsonrpc: '2.0',
      method: provider.RPCMethod.GetSmartContracts,
      params: [
        new CryptoUtils().toHex(new CryptoUtils().normaliseAddress(TEST_CONTRACT_ADDRESS))
      ]
    }

    expect(rpcRequest).toEqual(shouldBe)

    try {
      await blockchain.getSmartContracts()
    } catch (err) {
      expect(err).toEqual(new ArgumentError('addr', ERROR_MSGS.REQUIRED))
    }
  })

  it('Should can send getTotalCoinSupply method', async() => {
    const rpcRequest = await blockchain.getTotalCoinSupply()
    const shouldBe = {
      id: 1,
      jsonrpc: '2.0',
      method: provider.RPCMethod.GetTotalCoinSupply,
      params: []
    }

    expect(rpcRequest).toEqual(shouldBe)
  })

  it('Should can send getTransactionRate method', async() => {
    const rpcRequest = await blockchain.getTransactionRate()
    const shouldBe = {
      id: 1,
      jsonrpc: '2.0',
      method: provider.RPCMethod.GetTransactionRate,
      params: []
    }

    expect(rpcRequest).toEqual(shouldBe)
  })

  it('Should can send getTransactionsForTxBlock method', async() => {
    const txBlock = 300
    const rpcRequest = await blockchain.getTransactionsForTxBlock(txBlock)
    const shouldBe = {
      id: 1,
      jsonrpc: '2.0',
      method: provider.RPCMethod.GetTransactionsForTxBlock,
      params: [String(txBlock)]
    }

    expect(rpcRequest).toEqual(shouldBe)

    try {
      await blockchain.getTransactionsForTxBlock()
    } catch (err) {
      expect(err).toEqual(new ArgumentError('txBlock', ERROR_MSGS.REQUIRED))
    }
  })

  it('Should can send getTxBlock method', async() => {
    const blockNum = 100
    const rpcRequest = await blockchain.getTxBlock(blockNum)
    const shouldBe = {
      id: 1,
      jsonrpc: '2.0',
      method: provider.RPCMethod.GetTxBlock,
      params: [String(blockNum)]
    }

    expect(rpcRequest).toEqual(shouldBe)

    try {
      await blockchain.getTxBlock()
    } catch (err) {
      expect(err).toEqual(new ArgumentError('blockNum', ERROR_MSGS.REQUIRED))
    }
  })

  it('Should can send getTxBlockListing method', async() => {
    const max = 1300
    const rpcRequest = await blockchain.getTxBlockListing(max)
    const shouldBe = {
      id: 1,
      jsonrpc: '2.0',
      method: provider.RPCMethod.TxBlockListing,
      params: [String(max)]
    }

    expect(rpcRequest).toEqual(shouldBe)

    try {
      await blockchain.getTxBlockListing()
    } catch (err) {
      expect(err).toEqual(new ArgumentError('max', ERROR_MSGS.REQUIRED))
    }
  })

  it('Should can send getTxBlockRate method', async() => {
    const rpcRequest = await blockchain.getTxBlockRate()
    const shouldBe = {
      id: 1,
      jsonrpc: '2.0',
      method: provider.RPCMethod.GetTxBlockRate,
      params: []
    }

    expect(rpcRequest).toEqual(shouldBe)
  })

})
