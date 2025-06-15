import { describe, it, expect } from 'vitest';
import { ZILTransactionRequest, ZILTransactionReceipt, versionFromChainId } from '../../crypto/zilliqa_tx';
import { utils } from 'aes-js';

const CHAIN_ID = 42;
const SHOULD_BE_BYTES = '088180a80110011a14ebd8b370dddb636faf641040d2181c55190840fb22230a2103150a7f37063b134cde30070431a69148d60b252f4c7b38de33d813d329a7b7da2a120a100000000000000000000000000000000032120a100000000000000000000000000000000038a08d06';
const SHA512_SIZE = 64; 

describe('ZILTransaction encoding', () => {
  it('should encode Zilliqa transaction correctly', () => {
    const toAddr = utils.hex.toBytes('ebd8b370dddb636faf641040d2181c55190840fb');
    const pubKey = utils.hex.toBytes('03150a7f37063b134cde30070431a69148d60b252f4c7b38de33d813d329a7b7da');

    const txReq = new ZILTransactionRequest(
      CHAIN_ID,
      BigInt(1),
      BigInt(2000) / BigInt(10 ** 6), 
      BigInt(100000), 
      toAddr,
      BigInt(1) / BigInt(10 ** 6), 
      new Uint8Array(),
      new Uint8Array()
    );

    const txBytes = txReq.encode(pubKey);
    const encodedHex = utils.hex.fromBytes(txBytes);
    expect(encodedHex).toBe(SHOULD_BE_BYTES);

    const signature = txBytes.slice(0, SHA512_SIZE); 
    const txReceipt = new ZILTransactionReceipt(
      versionFromChainId(CHAIN_ID),
      BigInt(1),
      txReq.toProto(pubKey).gasprice!.data, 
      BigInt(100000),
      toAddr,
      txReq.toProto(pubKey).amount!.data, 
      pubKey,
      new Uint8Array(),
      new Uint8Array(),
      signature,
      false
    );

    const restoredReq = txReceipt.toRequest();
    const restoredBytes = restoredReq.encode(pubKey);
    const restoredHex = utils.hex.fromBytes(restoredBytes);

    expect(restoredHex).toBe(SHOULD_BE_BYTES);
    expect(restoredReq).toEqual(txReq);
  });
});
