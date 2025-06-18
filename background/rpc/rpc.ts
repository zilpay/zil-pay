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

export class NetworkProvider {
  public config: ChainConfig;

  constructor(config: ChainConfig) {
    this.config = config;
  }

  public async proxyReq(payload: JsonRPCRequest | JsonRPCRequest[]): Promise<any> {
    const provider = new RpcProvider(this.config);
    return provider.req<any>(payload);
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
          const balance = await processZilBalanceResponse(responses[i], contract, false);

          if (reqWithType.requestType.type === 'Balance') {
            const accountIndex = accounts.findIndex(
              acc => acc === reqWithType.requestType.address
            );
            if (accountIndex !== -1) {
              balances[accountIndex] = balance.toString();
            }
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
    } else {
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
  }
}
