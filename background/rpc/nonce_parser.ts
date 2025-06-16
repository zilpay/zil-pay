import { RpcProvider, type JsonRPCRequest } from './provider';
import { EvmMethods, ZilMethods } from '../../config/jsonrpc';
import { AddressType } from '../../crypto/keypair';
import { addr } from 'micro-eth-signer';
import { fromBech32Address } from '../../lib/zilliqa';
import { TypeOf } from 'lib/types';

export interface ZilBalance {
  balance: string;
  nonce: number;
}

export type NonceResponse = string | ZilBalance;

export async function buildNonceRequest(addressType: AddressType, address: string): Promise<JsonRPCRequest> {

  switch (addressType) {
    case AddressType.Bech32:
      const base16 = await fromBech32Address(address);
      return RpcProvider.buildPayload(
        ZilMethods.GetBalance,
        [base16]
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
    return parseInt(String(response).replace('0x', ''), 16) || 0;
  }
  return 0;
}

