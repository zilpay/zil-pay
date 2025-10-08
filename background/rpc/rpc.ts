import { ChainConfig, FToken } from '../storage';
import { RpcProvider, type JsonRPCResponse, type JsonRPCRequest } from './provider';
import { Address } from '../../crypto/address';
import {
  buildTokenRequests,
  processZilMetadataResponse,
  processEthMetadataResponse,
  processZilBalanceResponse,
  processEthBalanceResponse,
  MetadataField,
  type RequestType
} from './ft_parser';
import type { TransactionReceipt, TransactionRequest } from 'crypto/tx';
import { buildBatchGasRequest, EIP1559, EIP4844, processParseFeeHistoryRequest } from './gas_parse';
import { processNonceResponse } from './nonce_parser';
import { bigintToHex, hexToBigInt } from 'lib/utils/hex';
import { EvmMethods } from 'config/jsonrpc';
import type { EVMBlock } from './block';
import { type HistoricalTransaction } from './history_tx';
import { buildPayloadTxReceipt, buildSendSignedTxRequest, processTxReceiptResponse, processTxSendResponse } from './tx_parse';
import { AddressType } from 'config/wallet';
import type { GasFeeHistory, RequiredTxParams } from 'types/gas';

export class NetworkProvider {
  config: ChainConfig;

  constructor(config: ChainConfig) {
    this.config = config;
  }

  async proxyReq<T>(payload: JsonRPCRequest | JsonRPCRequest[]): Promise<JsonRPCResponse<unknown|T>> {
    const provider = new RpcProvider(this.config);
    return provider.req<JsonRPCResponse<unknown|T>>(payload);
  }

  async getCurrentBlockNumber(): Promise<bigint> {
    const provider = new RpcProvider(this.config);
    const payload = RpcProvider.buildPayload(EvmMethods.BlockNumber, []);
    const response = await provider.req<JsonRPCResponse<string>>(payload);

    if (response.error || !response.result) {
      throw new Error(response.error?.message);
    }

    return hexToBigInt(response.result);
  }

  async estimateBlockTime(): Promise<number> {
    const provider = new RpcProvider(this.config);

    const latestBlockPayload = RpcProvider.buildPayload(EvmMethods.GetBlockByNumber, ['latest', false]);
    const latestBlockResponse = await provider.req<JsonRPCResponse<EVMBlock>>(latestBlockPayload);

    if (latestBlockResponse.error || !latestBlockResponse.result) {
      throw new Error(latestBlockResponse.error?.message);
    }

    const latestBlock = latestBlockResponse.result;
    const latestTimestamp = hexToBigInt(latestBlock.timestamp);
    const latestBlockNumber = hexToBigInt(latestBlock.number);

    const previousBlockNumber = bigintToHex(latestBlockNumber - 1n, true);
    const previousBlockPayload = RpcProvider.buildPayload(EvmMethods.GetBlockByNumber, [previousBlockNumber, false]);
    const previousBlockResponse = await provider.req<JsonRPCResponse<EVMBlock>>(previousBlockPayload);

    if (previousBlockResponse.error || !previousBlockResponse.result) {
      throw new Error(previousBlockResponse.error?.message);
    }

    const previousBlock = previousBlockResponse.result;
    const previousTimestamp = hexToBigInt(previousBlock.timestamp);

    return Number(latestTimestamp - previousTimestamp);
  }

  async estimateGasParamsBatch(
    tx: TransactionRequest,
    sender: Address,
    blockCount: number,
    percentiles: number[] | null,
  ): Promise<RequiredTxParams> {
    const defaultPercentiles = [25.0, 50.0, 75.0];
    const percentilesToUse = percentiles || defaultPercentiles;
    const requests = await buildBatchGasRequest(
      tx,
      blockCount,
      percentilesToUse,
      this.config.features,
      sender
    );
    const provider = new RpcProvider(this.config);
    const responses = await provider.req<JsonRPCResponse<any>[]>(requests);

    if (responses.every(res => res.error)) {
        const allErrors = responses
            .map(res => res.error?.message)
            .filter(Boolean)
            .join(', ');
        throw new Error(`RPC Error: ${allErrors}`);
    }

    let nonce = 0;
    if (responses[0] && !responses[0].error) {
      nonce = processNonceResponse(responses[0].result);
    }
    
    let gasPrice = 0n;

    if (tx.evm) {
      gasPrice = responses[1]?.result ? hexToBigInt(responses[1].result) : 0n;
    } else if (tx.scilla) {
      gasPrice = BigInt(responses[1]?.result ?? 0);
    }

    const txEstimateGas = responses[2]?.result ? hexToBigInt(responses[2].result) : 0n;

    let maxPriorityFee = 0n;
    let feeHistory: GasFeeHistory = { maxFee: 0n, priorityFee: 0n, baseFee: 0n };
    let blobBaseFee = 0n;

    let responseIndex = 3;

    if (this.config.features.includes(EIP1559)) {
        if (responses[responseIndex] && responses[responseIndex].result) {
            maxPriorityFee = hexToBigInt(responses[responseIndex].result);
        }
        responseIndex++;
        if (responses[responseIndex] && responses[responseIndex].result) {
            feeHistory = processParseFeeHistoryRequest(responses[responseIndex].result);
        }
        responseIndex++;
    }

    if (this.config.features.includes(EIP4844)) {
        if (responses[responseIndex] && responses[responseIndex].result) {
             blobBaseFee = hexToBigInt(responses[responseIndex].result);
        }
    }
    
    return {
      nonce,
      gasPrice,
      txEstimateGas,
      maxPriorityFee,
      feeHistory,
      blobBaseFee
    };
  }

  async ftokenMeta(contract: Address, pubKeys: Uint8Array[]): Promise<FToken> {
    const requestsWithTypes = await buildTokenRequests(contract, pubKeys, false);
    const provider = new RpcProvider(this.config);

    const payloads = requestsWithTypes.map(r => r.payload);
    const responses = await provider.req<JsonRPCResponse<any>[]>(payloads);
    const balances: Record<number, string> = {};

    if (contract.type === AddressType.Bech32) {
      const { name, symbol, decimals } = processZilMetadataResponse(responses[0]);
      
      for (let i = 1; i < responses.length; i++) {
        const reqWithType = requestsWithTypes[i];

        if (reqWithType.requestType.type === 'Balance') {
          const addr = reqWithType.requestType.address;
          const balance = await processZilBalanceResponse(responses[i], addr, false);

          balances[reqWithType.requestType.pubKeyHash] = balance.toString();
        }
      }

      return new FToken({
        name,
        symbol,
        decimals,
        balances,
        addr: await contract.toZilBech32(),
        addrType: contract.type,
        chainHash: this.config.hash(),
        default_: false,
        native: false,
        logo: null,
        rate: 0
      });
    } else if (contract.type === AddressType.EthCheckSum) {
      let responseIterator = 0;
      const name = processEthMetadataResponse(responses[responseIterator++], MetadataField.Name);
      const symbol = processEthMetadataResponse(responses[responseIterator++], MetadataField.Symbol);
      const decimalsStr = processEthMetadataResponse(responses[responseIterator++], MetadataField.Decimals);
      const decimals = parseInt(decimalsStr, 10);

      requestsWithTypes.slice(3).forEach((reqWithType, index) => {
        if (reqWithType.requestType.type === 'Balance') {
          const response = responses[responseIterator + index];
          const balance = processEthBalanceResponse(response);

          if (reqWithType.requestType.type == 'Balance') {
            balances[reqWithType.requestType.pubKeyHash] = balance.toString();
          }
        }
      });

      return new FToken({
        name,
        symbol,
        decimals,
        balances,
        addr: await contract.toEthChecksum(),
        addrType: contract.type,
        chainHash: this.config.hash(),
        default_: false,
        native: false,
        logo: null,
        rate: 0
      });
    }

    throw new Error("unsupported contract");
  }

  async updateTransactionsReceipt(txns: HistoricalTransaction[]): Promise<void> {
    if (txns.length === 0) {
      return;
    }

    const requests = txns.map(tx => buildPayloadTxReceipt(tx));
    const provider = new RpcProvider(this.config);
    const responses = await provider.req<JsonRPCResponse<unknown>[]>(requests);

    await Promise.all(responses.map((res, index) => {
      const tx = txns[index];
      return processTxReceiptResponse(res, tx);
    }));
  }

  async broadcastSignedTransactions(txns: TransactionReceipt[]): Promise<TransactionReceipt[]> {
    const allRequests: JsonRPCRequest[] = [];

    for (const tx of txns) {
      if (!(await tx.verify())) {
        throw new Error('Invalid signature');
      }
      allRequests.push(await buildSendSignedTxRequest(tx));
    }
  
    const provider = new RpcProvider(this.config);
    const responses = await provider.req<JsonRPCResponse<unknown>[]>(allRequests);

    responses.forEach((response, index) => {
      const tx = txns[index];
      processTxSendResponse(response, tx);
    });
  
    return txns;
  }

  async updateBalances(tokens: FToken[], keys: Uint8Array[]): Promise<void> {
    const allRequests: { payload: JsonRPCRequest; requestType: RequestType; tokenIndex: number; }[] = [];

    for (let tokenIndex = 0; tokenIndex < tokens.length; tokenIndex++) {
      const token = tokens[tokenIndex];
      const tokenAddress = Address.fromStr(token.addr);
      const requests = await buildTokenRequests(tokenAddress, keys, token.native);

      for (const req of requests) {
        if (req.requestType.type === 'Balance') {
          allRequests.push({ ...req, tokenIndex });
        }
      }
    }

    if (allRequests.length === 0) {
      return;
    }

    const provider = new RpcProvider(this.config);
    const payloads = allRequests.map(r => r.payload);
    const responses = await provider.req<JsonRPCResponse<any>[]>(payloads);

    for (let i = 0; i < allRequests.length; i++) {
      const requestInfo = allRequests[i];
      const response = responses[i];
      const token = tokens[requestInfo.tokenIndex];
      const tokenAddress = Address.fromStr(token.addr);
    
      if (requestInfo.requestType.type !== 'Balance') continue;

      const account = requestInfo.requestType.address;
    
      if (tokenAddress.type === AddressType.Bech32) {
        const balance = await processZilBalanceResponse(response, account, token.native);
        token.balances[requestInfo.requestType.pubKeyHash] = balance.toString();
      } else if (tokenAddress.type === AddressType.EthCheckSum) {
        const balance = processEthBalanceResponse(response);
        token.balances[requestInfo.requestType.pubKeyHash] = balance.toString();
      }
    }
  }
}
