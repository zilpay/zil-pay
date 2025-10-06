import { RpcProvider, type JsonRPCRequest } from './provider';
import { EvmMethods, ZilMethods } from '../../config/jsonrpc';
import { addr } from 'micro-eth-signer';
import { fromBech32Address } from '../../lib/zilliqa';
import { TypeOf } from 'lib/types';
import { hexToBigInt, stripHexPrefix } from 'lib/utils/hex';
import { AddressType } from 'config/wallet';

export interface ZilBalance {
  balance: string;
  nonce: number;
}

export type NonceResponse = string | ZilBalance;

export async function buildNonceRequest(addressType: AddressType, address: string): Promise<JsonRPCRequest> {
  switch (addressType) {
    case AddressType.Bech32:
      const base16 = fromBech32Address(address);
      return RpcProvider.buildPayload(
        ZilMethods.GetBalance,
        [stripHexPrefix(base16).toLowerCase()]
      );
    case AddressType.EthCheckSum:
      const ethAddress = addr.addChecksum(address);
      return RpcProvider.buildPayload(
        EvmMethods.GetTransactionCount,
        [ethAddress, 'latest']
      );
    default:
      throw new Error('Unsupported address type');
  }
}

export function processNonceResponse(response: NonceResponse): number {
  if (TypeOf.isObject(response)) {
    const res = response as ZilBalance;
    return res.nonce || 0;
  } else if (TypeOf.isString(response)) {
    return Number(hexToBigInt(String(response)));
  }

  return 0;
}

