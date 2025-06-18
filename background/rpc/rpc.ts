import { ChainConfig, FToken } from '../storage';
import { RpcProvider, type JsonRPCResponse, type JsonRPCRequest } from './provider';
import { Address, AddressType } from '../../crypto/address';
import {
  buildTokenRequests,
  processZilMetadataResponse,
  processEthMetadataResponse,
  processZilBalanceResponse,
  processEthBalanceResponse,
  MetadataField
} from './ft_parser';
import type { TransactionRequest } from 'crypto/tx';
import { buildBatchGasRequest, EIP1559, EIP4844, processParseFeeHistoryRequest, type GasFeeHistory, type RequiredTxParams } from './gas_parse';
import { processNonceResponse } from './nonce_parser';
import { hexToBigInt } from 'lib/utils/hex';

export class NetworkProvider {
  public config: ChainConfig;

  constructor(config: ChainConfig) {
    this.config = config;
  }

  public async proxyReq(payload: JsonRPCRequest | JsonRPCRequest[]): Promise<any> {
    const provider = new RpcProvider(this.config);
    return provider.req<any>(payload);
  }

  public async estimate_params_batch(
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
    
    const gasPrice = responses[1]?.result ? hexToBigInt(responses[1].result) : 0n;
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

  public async ftoken_meta(contract: Address, accounts: Address[]): Promise<FToken> {
    const requestsWithTypes = await buildTokenRequests(contract, accounts, false);
    const provider = new RpcProvider(this.config);

    const payloads = requestsWithTypes.map(r => r.payload);
    const responses = await provider.req<JsonRPCResponse<any>[]>(payloads);
    const balances: Record<number, string> = {};

    if (contract.type === AddressType.Bech32) {
      const { name, symbol, decimals } = processZilMetadataResponse(responses[0]);
      
      for (let i = 1; i < responses.length; i++) {
        const reqWithType = requestsWithTypes[i];

        if (reqWithType.requestType.type === 'Balance') {
          const addresss = reqWithType.requestType.address;
          const balance = await processZilBalanceResponse(responses[i], addresss, false);
          const accountIndex = accounts.findIndex(
            acc => acc === reqWithType.requestType.address
          );

          if (accountIndex !== -1) {
            balances[accountIndex] = balance.toString();
          }
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
            const accountIndex = accounts.findIndex(
              acc => acc === reqWithType.requestType.address,
            );
            if (accountIndex !== -1) {
              balances[accountIndex] = balance.toString();
            }
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
}
