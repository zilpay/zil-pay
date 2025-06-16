import { RpcProvider, type JsonRPCRequest } from './provider';
import { EvmMethods, ZilMethods } from 'config/jsonrpc';
import { createContract } from 'micro-eth-signer/abi';
import { hexToBigInt, hexToUint8Array, uint8ArrayToHex } from 'lib/utils/hex';
import { Address, AddressType } from 'crypto/address';
import { TypeOf } from 'lib/types';

const ERC20_ABI = [
  { name: 'name', type: 'function', outputs: [{ type: 'string' }] },
  { name: 'symbol', type: 'function', outputs: [{ type: 'string' }] },
  { name: 'decimals', type: 'function', outputs: [{ type: 'uint8' }] },
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'transfer',
    type: 'function',
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
] as const;

export enum MetadataField {
  Name = 'name',
  Symbol = 'symbol',
  Decimals = 'decimals',
}

type FunctionName = 'name' | 'symbol' | 'decimals' | 'balanceOf' | 'transfer';
type FunctionArgs = {
  name: [];
  symbol: [];
  decimals: [];
  balanceOf: [string];
  transfer: [string, bigint];
};

export type RequestType =
  | { type: 'Metadata'; field: MetadataField }
  | { type: 'Balance'; address: string };

export interface RpcResult<T> {
  id: number | string;
  jsonrpc: string;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export interface GetTokenInitItem {
  vname: string;
  type: string;
  value: string;
}

export interface ZilBalanceResponse {
  balance: string;
  nonce: number;
}

export interface ZilSmartContractSubStateResponse {
  balances: {
    [key: string]: string;
  };
}

function validateResponse<T>(response: RpcResult<T>): T {
  if (response.error) {
    throw new Error(
      `RPC Error (code: ${response.error.code}): ${response.error.message}`,
    );
  }
  if (TypeOf.isUndefined(response.result)) {
    throw new Error('RPC Error: Response missing result field');
  }

  return response.result as T;
}

export class ERC20Helper {
  readonly #contract;

  constructor() {
    this.#contract = createContract(ERC20_ABI);
  }

  encodeFunctionCall<T extends FunctionName>(
    functionName: T,
    args: FunctionArgs[T],
  ): string {
    let encodedData: Uint8Array;

    switch (functionName) {
      case 'name':
        encodedData = this.#contract.name.encodeInput();
        break;
      case 'symbol':
        encodedData = this.#contract.symbol.encodeInput();
        break;
      case 'decimals':
        encodedData = this.#contract.decimals.encodeInput();
        break;
      case 'balanceOf':
        encodedData = this.#contract.balanceOf.encodeInput(String(args[0]));
        break;
      case 'transfer':
        encodedData = this.#contract.transfer.encodeInput({
          recipient: String(args[0]),
          amount: BigInt(args[1] ?? 0), 
        });
        break;
      default:
        throw new Error(`Unsupported function: ${functionName}`);
    }

    return uint8ArrayToHex(encodedData, true);
  }

  decodeFunctionOutput(functionName: FunctionName, data: string) {
    const bytes = hexToUint8Array(data);

    switch (functionName) {
      case 'name':
        return this.#contract.name.decodeOutput(bytes);
      case 'symbol':
        return this.#contract.symbol.decodeOutput(bytes);
      case 'decimals':
        return this.#contract.decimals.decodeOutput(bytes);
      case 'balanceOf':
        return this.#contract.balanceOf.decodeOutput(bytes);
      case 'transfer':
        return this.#contract.transfer.decodeOutput(bytes);
      default:
        throw new Error(`Unsupported function: ${functionName}`);
    }
  }

  public generateTransferInput(to: string, amount: bigint): string {
    return this.encodeFunctionCall('transfer', [to, amount]);
  }
}

export function generateErc20TransferData(to: string, amount: bigint): string {
  const erc20 = new ERC20Helper();
  return erc20.generateTransferInput(to, amount);
}

export async function buildTokenRequests(
  contract: Address,
  accounts: Address[],
  native: boolean,
): Promise<{ payload: JsonRPCRequest; requestType: RequestType }[]> {
  const requests: { payload: JsonRPCRequest; requestType: RequestType }[] = [];
  if (contract.type === AddressType.Bech32) {
    await buildZilRequests(contract, accounts, native, requests);
  } else {
    await buildEthRequests(contract, accounts, native, requests);
  }

  return requests;
}

async function buildZilRequests(
  contract: Address,
  accounts: Address[],
  native: boolean,
  requests: { payload: JsonRPCRequest; requestType: RequestType }[],
): Promise<void> {
  const base16Contract = contract.toBase16();
  requests.push({
    payload: RpcProvider.buildPayload(ZilMethods.GetSmartContractInit, [
      base16Contract,
    ]),
    requestType: { type: 'Metadata', field: MetadataField.Name },
  });
  for (const account of accounts) {
    const base16Account = (await account.toZilChecksum()).toLowerCase();
    let payload;
    if (native) {
      payload = RpcProvider.buildPayload(ZilMethods.GetBalance, [
        base16Account,
      ]);
    } else {
      payload = RpcProvider.buildPayload(ZilMethods.GetSmartContractSubState, [
        base16Contract,
        'balances',
        [base16Account],
      ]);
    }
    requests.push({
      payload,
      requestType: { type: 'Balance', address: (await account.toZilBech32()) },
    });
  }
}

async function buildEthRequests(
  contract: Address,
  accounts: Address[],
  native: boolean,
  requests: { payload: JsonRPCRequest; requestType: RequestType }[],
): Promise<void> {
  const erc20 = new ERC20Helper();
  const tokenAddr = await contract.toEthChecksum();

  const buildEthCall = (data: string): JsonRPCRequest => {
    return RpcProvider.buildPayload(EvmMethods.Call, [
      {
        to: tokenAddr,
        data,
      },
      'latest',
    ]);
  };

  const metadataFields: FunctionName[] = [
    'name',
    'symbol',
    'decimals',
  ];

  for (const field of metadataFields) {
    // `encodeFunctionCall` теперь ожидает пустой массив для этих вызовов.
    const data = erc20.encodeFunctionCall(field, []);
    requests.push({
      payload: buildEthCall(data),
      requestType: { type: 'Metadata', field: field as MetadataField },
    });
  }

  for (const account of accounts) {
    let payload;
    const ethAddress = await account.toEthChecksum();
    if (native) {
      payload = RpcProvider.buildPayload(EvmMethods.GetBalance, [
        ethAddress,
        'latest',
      ]);
    } else {
      // `encodeFunctionCall` ожидает массив с одним элементом.
      const callData = erc20.encodeFunctionCall('balanceOf', [
        ethAddress,
      ]);
      payload = buildEthCall(callData);
    }
    requests.push({
      payload,
      requestType: { type: 'Balance', address: ethAddress },
    });
  }
}

export function processEthMetadataResponse(
  response: RpcResult<string>,
  field: MetadataField,
): string {
  const resultHex = validateResponse(response);
  const erc20 = new ERC20Helper();

  const decoded = erc20.decodeFunctionOutput(
    field as FunctionName,
    resultHex,
  );
  // `decodeOutput` возвращает значение напрямую для функций с одним выходом.
  return String(decoded);
}

export function processZilMetadataResponse(
  response: RpcResult<GetTokenInitItem[]>,
): { name: string; symbol: string; decimals: number } {
  const initData = validateResponse(response);

  const getField = (fieldName: string): string => {
    const item = initData.find((item) => item.vname === fieldName);
    if (!item) {
      throw new Error(`Invalid contract init: missing ${fieldName}`);
    }
    return item.value;
  };

  const name = getField('name');
  const symbol = getField('symbol');
  const decimals = parseInt(getField('decimals'), 10);
  if (isNaN(decimals)) {
    throw new Error('Invalid decimals format in contract init');
  }

  return { name, symbol, decimals };
}

export function processEthBalanceResponse(response: RpcResult<string>): bigint {
  const resultHex = validateResponse(response);
  return hexToBigInt(resultHex);
}

export async function processZilBalanceResponse(
  response: RpcResult<ZilBalanceResponse | ZilSmartContractSubStateResponse>,
  account: Address,
  isNative: boolean,
): Promise<bigint> {
  try {
    const result = validateResponse(response);
    if (isNative) {
      return BigInt((result as ZilBalanceResponse).balance || '0');
    } else {
      const addr = (await account.toZilChecksum()).toLowerCase();
      const balances = (result as ZilSmartContractSubStateResponse).balances;
      return BigInt(balances?.[addr] || '0');
    }
  } catch (error) {
    return 0n;
  }
}

