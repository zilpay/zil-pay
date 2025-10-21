import { createContract } from 'micro-eth-signer/advanced/abi.js';
import { RpcError, RpcProvider, type JsonRPCRequest, type JsonRPCResponse } from './provider';
import { EvmMethods, ZilMethods } from 'config/jsonrpc';
import { hexToBigInt, hexToUint8Array, uint8ArrayToHex } from 'lib/utils/hex';
import { Address } from 'crypto/address';
import { TypeOf } from 'lib/types';
import { ETHEREUM, ZILLIQA } from 'config/slip44';
import { hashXOR } from 'lib/utils/hashing';
import { AddressType } from 'config/wallet';

// ERC721 ABI
const ERC721_ABI = [
  { name: 'name', type: 'function', outputs: [{ type: 'string' }] },
  { name: 'symbol', type: 'function', outputs: [{ type: 'string' }] },
  { name: 'totalSupply', type: 'function', outputs: [{ type: 'uint256' }] },
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'ownerOf',
    type: 'function',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ type: 'address' }],
  },
  {
    name: 'tokenURI',
    type: 'function',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ type: 'string' }],
  },
] as const;

// ERC1155 ABI
const ERC1155_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'id', type: 'uint256' }
    ],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'balanceOfBatch',
    type: 'function',
    inputs: [
      { name: 'accounts', type: 'address[]' },
      { name: 'ids', type: 'uint256[]' }
    ],
    outputs: [{ type: 'uint256[]' }],
  },
  {
    name: 'uri',
    type: 'function',
    inputs: [{ name: 'id', type: 'uint256' }],
    outputs: [{ type: 'string' }],
  },
] as const;

export enum NFTStandard {
  ERC721 = 'ERC721',
  ERC1155 = 'ERC1155',
  ZRC1 = 'ZRC1',
  ZRC6 = 'ZRC6',
  Unknown = 'Unknown',
}

export enum NFTMetadataField {
  Name = 'name',
  Symbol = 'symbol',
  TotalSupply = 'totalSupply',
}

type ERC721FunctionName = 'name' | 'symbol' | 'totalSupply' | 'balanceOf' | 'ownerOf' | 'tokenURI';
type ERC1155FunctionName = 'balanceOf' | 'balanceOfBatch' | 'uri';

type ERC721FunctionArgs = {
  name: [];
  symbol: [];
  totalSupply: [];
  balanceOf: [string];
  ownerOf: [bigint];
  tokenURI: [bigint];
};

type ERC1155FunctionArgs = {
  balanceOf: [string, bigint];
  balanceOfBatch: [string[], bigint[]];
  uri: [bigint];
};

export type NFTRequestType =
  | { type: 'Metadata'; field: NFTMetadataField; standard: NFTStandard }
  | { type: 'Balance'; address: Address; pubKeyHash: number; standard: NFTStandard; tokenId?: bigint }
  | { type: 'Standard' };

export interface ZRC6Init {
  vname: string;
  type: string;
  value: string;
}

export interface ZilContractState {
  [key: string]: any;
}

export interface NFTMetadata {
  name: string;
  symbol: string;
  totalSupply?: string;
  standard: NFTStandard;
  balances: Record<number, string>;
  contractAddress: string;
  baseURI?: string;
  tokens?: Record<number, Record<string, NFTTokenInfo>>;
}

export interface NFTTokenInfo {
  id: string;
  url?: string;
}

function validateResponse<T>(response: JsonRPCResponse<T>, ignore: number[] = []): T {
  if (response.error) {
    if (ignore.includes(response.error.code)) {
      return null as T;
    }
    throw new RpcError(
      response.error.message,
      response.error.code,
      response.error.data,
    );
  }
  if (TypeOf.isUndefined(response.result)) {
    throw new RpcError('Bad Response', -32603);
  }

  return response.result as T;
}

export class ERC721Helper {
  readonly #contract;

  constructor() {
    this.#contract = createContract(ERC721_ABI);
  }

  encodeFunctionCall<T extends ERC721FunctionName>(
    functionName: T,
    args: ERC721FunctionArgs[T],
  ): string {
    let encodedData: Uint8Array;

    switch (functionName) {
      case 'name':
        encodedData = this.#contract.name.encodeInput();
        break;
      case 'symbol':
        encodedData = this.#contract.symbol.encodeInput();
        break;
      case 'totalSupply':
        encodedData = this.#contract.totalSupply.encodeInput();
        break;
      case 'balanceOf':
        encodedData = this.#contract.balanceOf.encodeInput(String(args[0]));
        break;
      case 'ownerOf':
        encodedData = this.#contract.ownerOf.encodeInput(BigInt(args[0] ?? 0));
        break;
      case 'tokenURI':
        encodedData = this.#contract.tokenURI.encodeInput(BigInt(args[0] ?? 0));
        break;
      default:
        throw new Error(`Unsupported function: ${functionName}`);
    }

    return uint8ArrayToHex(encodedData, true);
  }

  decodeFunctionOutput(functionName: ERC721FunctionName, data: string) {
    const bytes = hexToUint8Array(data);

    switch (functionName) {
      case 'name':
        return this.#contract.name.decodeOutput(bytes);
      case 'symbol':
        return this.#contract.symbol.decodeOutput(bytes);
      case 'totalSupply':
        return this.#contract.totalSupply.decodeOutput(bytes);
      case 'balanceOf':
        return this.#contract.balanceOf.decodeOutput(bytes);
      case 'ownerOf':
        return this.#contract.ownerOf.decodeOutput(bytes);
      case 'tokenURI':
        return this.#contract.tokenURI.decodeOutput(bytes);
      default:
        throw new Error(`Unsupported function: ${functionName}`);
    }
  }
}

export class ERC1155Helper {
  readonly #contract;

  constructor() {
    this.#contract = createContract(ERC1155_ABI);
  }

  encodeFunctionCall<T extends ERC1155FunctionName>(
    functionName: T,
    args: ERC1155FunctionArgs[T],
  ): string {
    let encodedData: Uint8Array;

    switch (functionName) {
      case 'balanceOf':
        encodedData = this.#contract.balanceOf.encodeInput({
          account: String(args[0]),
          id: BigInt((args[1] as bigint) ?? 0),
        });
        break;
      case 'balanceOfBatch':
        encodedData = this.#contract.balanceOfBatch.encodeInput({
          accounts: args[0] as string[],
          ids: (args[1] as bigint[]).map(id => BigInt(id)),
        });
        break;
      case 'uri':
        encodedData = this.#contract.uri.encodeInput(BigInt((args[0] as bigint) ?? 0));
        break;
      default:
        throw new Error(`Unsupported function: ${functionName}`);
    }

    return uint8ArrayToHex(encodedData, true);
  }

  decodeFunctionOutput(functionName: ERC1155FunctionName, data: string) {
    const bytes = hexToUint8Array(data);

    switch (functionName) {
      case 'balanceOf':
        return this.#contract.balanceOf.decodeOutput(bytes);
      case 'balanceOfBatch':
        return this.#contract.balanceOfBatch.decodeOutput(bytes);
      case 'uri':
        return this.#contract.uri.decodeOutput(bytes);
      default:
        throw new Error(`Unsupported function: ${functionName}`);
    }
  }
}

// Detect NFT standard
async function detectNFTStandard(
  contract: Address,
  provider: RpcProvider,
): Promise<NFTStandard> {
  const contractAddr = await contract.toEthChecksum();
  
  const erc721InterfaceId = hexToUint8Array('0x80ac58cd');
  const erc1155InterfaceId = hexToUint8Array('0xd9b67a26');
  
  const supportsInterfaceABI = [{
    name: 'supportsInterface',
    type: 'function',
    inputs: [{ name: 'interfaceId', type: 'bytes4' }],
    outputs: [{ type: 'bool' }],
  }] as const;
  
  const contract721 = createContract(supportsInterfaceABI);
  const encoded721 = contract721.supportsInterface.encodeInput(erc721InterfaceId);
  const data721 = uint8ArrayToHex(encoded721, true);
  
  try {
    const payload721 = RpcProvider.buildPayload(EvmMethods.Call, [
      { to: contractAddr, data: data721 },
      'latest',
    ]);
    const response721 = await provider.req<JsonRPCResponse<string>>(payload721, false, [-32000]);
    
    if (response721.result) {
      const result = hexToBigInt(response721.result);
      if (result === 1n) {
        return NFTStandard.ERC721;
      }
    }
  } catch {
  }
  
  const encoded1155 = contract721.supportsInterface.encodeInput(erc1155InterfaceId);
  const data1155 = uint8ArrayToHex(encoded1155, true);
  
  try {
    const payload1155 = RpcProvider.buildPayload(EvmMethods.Call, [
      { to: contractAddr, data: data1155 },
      'latest',
    ]);
    const response1155 = await provider.req<JsonRPCResponse<string>>(payload1155, false, [-32000]);
    
    if (response1155.result) {
      const result = hexToBigInt(response1155.result);
      if (result === 1n) {
        return NFTStandard.ERC1155;
      }
    }
  } catch {
  }
  
  return NFTStandard.Unknown;
}

export async function buildNFTRequests(
  contract: Address,
  pubKeys: Uint8Array[],
  provider: RpcProvider,
): Promise<{ payload: JsonRPCRequest; requestType: NFTRequestType }[]> {
  const requests: { payload: JsonRPCRequest; requestType: NFTRequestType }[] = [];

  if (contract.type === AddressType.Bech32) {
    await buildZilNFTRequests(contract, pubKeys, requests);
  } else if (contract.type === AddressType.EthCheckSum) {
    await buildEthNFTRequests(contract, pubKeys, provider, requests);
  }

  return requests;
}

async function buildZilNFTRequests(
  contract: Address,
  pubKeys: Uint8Array[],
  requests: { payload: JsonRPCRequest; requestType: NFTRequestType }[],
): Promise<void> {
  const base16Contract = contract.toBase16();
  
  // Получаем весь state контракта
  requests.push({
    payload: RpcProvider.buildPayload(ZilMethods.GetSmartContractInit, [base16Contract]),
    requestType: { type: 'Metadata', field: NFTMetadataField.Name, standard: NFTStandard.ZRC6 },
  });

  // Получаем owned_token_count для каждого аккаунта
  for (const pubKey of pubKeys) {
    const addr = await Address.fromPubKey(pubKey, ZILLIQA);
    const base16Account = (await addr.toZilChecksum()).toLowerCase();
    
    const payload = RpcProvider.buildPayload(ZilMethods.GetSmartContractSubState, [
      base16Contract,
      'owned_token_count',
      [base16Account],
    ]);
    
    requests.push({
      payload,
      requestType: {
        type: 'Balance',
        address: addr,
        pubKeyHash: hashXOR(pubKey),
        standard: NFTStandard.ZRC6,
      },
    });
  }
}

async function buildEthNFTRequests(
  contract: Address,
  pubKeys: Uint8Array[],
  provider: RpcProvider,
  requests: { payload: JsonRPCRequest; requestType: NFTRequestType }[],
): Promise<void> {
  const contractAddr = await contract.toEthChecksum();
  
  // Detect standard first
  const standard = await detectNFTStandard(contract, provider);
  
  const buildEthCall = (data: string): JsonRPCRequest => {
    return RpcProvider.buildPayload(EvmMethods.Call, [
      { to: contractAddr, data },
      'latest',
    ]);
  };

  if (standard === NFTStandard.ERC721) {
    const erc721 = new ERC721Helper();
    
    // Metadata requests
    const nameData = erc721.encodeFunctionCall('name', []);
    requests.push({
      payload: buildEthCall(nameData),
      requestType: { type: 'Metadata', field: NFTMetadataField.Name, standard },
    });
    
    const symbolData = erc721.encodeFunctionCall('symbol', []);
    requests.push({
      payload: buildEthCall(symbolData),
      requestType: { type: 'Metadata', field: NFTMetadataField.Symbol, standard },
    });
    
    const totalSupplyData = erc721.encodeFunctionCall('totalSupply', []);
    requests.push({
      payload: buildEthCall(totalSupplyData),
      requestType: { type: 'Metadata', field: NFTMetadataField.TotalSupply, standard },
    });
    
    // Balance requests
    for (const pubKey of pubKeys) {
      const addr = await Address.fromPubKey(pubKey, ETHEREUM);
      const ethAddress = await addr.toEthChecksum();
      const balanceData = erc721.encodeFunctionCall('balanceOf', [ethAddress]);
      
      requests.push({
        payload: buildEthCall(balanceData),
        requestType: {
          type: 'Balance',
          address: addr,
          pubKeyHash: hashXOR(pubKey),
          standard,
        },
      });
    }
  } else if (standard === NFTStandard.ERC1155) {
    const erc1155 = new ERC1155Helper();
    
    // ERC1155 doesn't have name/symbol in standard, but we try
    // Balance requests (need tokenId for ERC1155)
    for (const pubKey of pubKeys) {
      const addr = await Address.fromPubKey(pubKey, ETHEREUM);
      const ethAddress = await addr.toEthChecksum();
      // For ERC1155, we typically need to know tokenId
      // This is a simplified version - you might want to fetch owned token IDs first
      const balanceData = erc1155.encodeFunctionCall('balanceOf', [ethAddress, 0n]);
      
      requests.push({
        payload: buildEthCall(balanceData),
        requestType: {
          type: 'Balance',
          address: addr,
          pubKeyHash: hashXOR(pubKey),
          standard,
          tokenId: 0n,
        },
      });
    }
  }
}

export function processEthNFTMetadataResponse(
  response: JsonRPCResponse<string>,
  field: NFTMetadataField,
  standard: NFTStandard,
): string {
  const resultHex = validateResponse(response, [-32000]);
  
  if (!resultHex || resultHex === '0x') {
    return '';
  }
  
  if (standard === NFTStandard.ERC721) {
    const erc721 = new ERC721Helper();
    const decoded = erc721.decodeFunctionOutput(field as ERC721FunctionName, resultHex);
    return String(decoded);
  }
  
  return '';
}

export function processZilNFTMetadataResponse(
  response: JsonRPCResponse<ZRC6Init[]>,
): { name: string; symbol: string; baseURI?: string } {
  const initData = validateResponse(response);

  const getField = (fieldName: string): string => {
    const item = initData.find((item) => item.vname === fieldName);
    return item?.value ?? '';
  };

  const name = getField('name');
  const symbol = getField('symbol');
  const baseURI = getField('base_uri');

  return { name, symbol, baseURI };
}

export function processEthNFTBalanceResponse(
  response: JsonRPCResponse<string>,
): bigint {
  const resultHex = validateResponse(response, [-32000]);
  
  return hexToBigInt(resultHex);
}

export async function processZilNFTBalanceResponse(
  response: JsonRPCResponse<{ [key: string]: any }>,
  account: Address,
): Promise<{ balance: bigint; tokens?: Record<string, NFTTokenInfo> }> {
  const IGNORE_CODES = [-5];
  const result = validateResponse(response, IGNORE_CODES);

  if (!result) {
    return { balance: 0n };
  }

  const addr = (await account.toZilChecksum()).toLowerCase();
  
  if (typeof result[addr] === 'string') {
    return { balance: BigInt(result[addr] || '0') };
  }
  
  if (typeof result[addr] === 'object') {
    const tokensMap = result[addr] as Record<string, string>;
    const tokens: Record<string, NFTTokenInfo> = {};
    
    for (const [tokenId] of Object.entries(tokensMap)) {
      tokens[tokenId] = {
        id: tokenId,
      };
    }
    
    return { 
      balance: BigInt(Object.keys(tokens).length),
      tokens 
    };
  }

  return { balance: 0n };
}
