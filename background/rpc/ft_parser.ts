import { RpcProvider, type JsonRPCRequest } from '../rpc/provider';
import { EvmMethods, ZilMethods } from '../../config/jsonrpc';
import { createContract } from 'micro-eth-signer/abi/decoder';

type Hex = `0x${string}`;

function toHex(bytes: Uint8Array): Hex {
  return `0x${Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')}`;
}

function fromHex(hexString: Hex): Uint8Array {
  const hex = hexString.startsWith('0x') ? hexString.slice(2) : hexString;
  if (hex.length % 2 !== 0) throw new Error('Invalid hex string');
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    const j = i * 2;
    bytes[i] = parseInt(hex.slice(j, j + 2), 16);
  }
  return bytes;
}

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
    data?: any;
  };
}

export interface GetTokenInitItem {
  vname: string;
  type: string;
  value: any;
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
  if (typeof response.result === 'undefined') {
    throw new Error('RPC Error: Response missing result field');
  }
  return response.result;
}

export class ERC20Helper {
  private readonly contract;

  constructor() {
    this.contract = createContract(ERC20_ABI);
  }

  encodeFunctionCall(
    functionName: keyof typeof this.contract,
    args: any[],
  ): Hex {
    // @ts-ignore
    const data = this.contract[functionName].encodeInput(...args);
    return toHex(data);
  }

  decodeFunctionOutput(
    functionName: keyof typeof this.contract,
    data: Hex,
  ): any {
    const bytes = fromHex(data);
    // @ts-ignore
    return this.contract[functionName].decodeOutput(bytes);
  }

  public generateTransferInput(to: Hex, amount: bigint): Hex {
    return this.encodeFunctionCall('transfer', [to, amount]);
  }
}

export function generateErc20TransferData(to: Hex, amount: bigint): Hex {
  const erc20 = new ERC20Helper();
  return erc20.generateTransferInput(to, amount);
}

export function buildTokenRequests(
  contract: Address,
  accounts: Address[],
  native: boolean,
): { payload: JsonRPCRequest; requestType: RequestType }[] {
  const requests: { payload: JsonRPCRequest; requestType: RequestType }[] = [];

  if (contract.isZil()) {
    buildZilRequests(contract, accounts, native, requests);
  } else {
    buildEthRequests(contract, accounts, native, requests);
  }

  return requests;
}

function buildZilRequests(
  contract: Address,
  accounts: Address[],
  native: boolean,
  requests: { payload: JsonRPCRequest; requestType: RequestType }[],
): void {
  const base16Contract = contract.toZilBase16();

  requests.push({
    payload: RpcProvider.buildPayload(ZilMethods.GetSmartContractInit, [
      base16Contract,
    ]),
    requestType: { type: 'Metadata', field: MetadataField.Name },
  });

  for (const account of accounts) {
    const base16Account = account.toZilChecksum().toLowerCase();
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
      requestType: { type: 'Balance', address: account },
    });
  }
}

function buildEthRequests(
  contract: Address,
  accounts: Address[],
  native: boolean,
  requests: { payload: JsonRPCRequest; requestType: RequestType }[],
): void {
  const erc20 = new ERC20Helper();
  const tokenAddr = contract.toEthAddress();

  const buildEthCall = (data: Hex): JsonRPCRequest => {
    return RpcProvider.buildPayload(EvmMethods.Call, [
      {
        to: tokenAddr,
        data,
      },
      'latest',
    ]);
  };

  const metadataFields: ('name' | 'symbol' | 'decimals')[] = [
    MetadataField.Name,
    MetadataField.Symbol,
    MetadataField.Decimals,
  ];

  for (const field of metadataFields) {
    const data = erc20.encodeFunctionCall(field, []);
    requests.push({
      payload: buildEthCall(data),
      requestType: { type: 'Metadata', field: field as MetadataField },
    });
  }

  for (const account of accounts) {
    let payload;
    if (native) {
      payload = RpcProvider.buildPayload(EvmMethods.GetBalance, [
        account.toEthAddress(),
        'latest',
      ]);
    } else {
      const callData = erc20.encodeFunctionCall('balanceOf', [
        account.toEthAddress(),
      ]);
      payload = buildEthCall(callData);
    }
    requests.push({
      payload,
      requestType: { type: 'Balance', address: account },
    });
  }
}

export function processEthMetadataResponse(
  response: RpcResult<Hex>,
  field: MetadataField,
): string {
  const resultHex = validateResponse(response);
  const erc20 = new ERC20Helper();

  const decoded = erc20.decodeFunctionOutput(
    field as 'name' | 'symbol' | 'decimals',
    resultHex,
  );

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

export function processEthBalanceResponse(response: RpcResult<Hex>): bigint {
  const resultHex = validateResponse(response);
  return BigInt(resultHex);
}

export function processZilBalanceResponse(
  response: RpcResult<ZilBalanceResponse | ZilSmartContractSubStateResponse>,
  account: Address,
  isNative: boolean,
): bigint {
  try {
    const result = validateResponse(response);

    if (isNative) {
      return BigInt((result as ZilBalanceResponse).balance || '0');
    } else {
      const addr = account.toZilChecksum().toLowerCase();
      const balances = (result as ZilSmartContractSubStateResponse).balances;
      return BigInt(balances?.[addr] || '0');
    }
  } catch (error) {
    return 0n;
  }
}

