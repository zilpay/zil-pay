import { describe, it, expect } from 'vitest';
import { ZILTransactionRequest, ZILTransactionReceipt, versionFromChainId } from '../../crypto/zilliqa_tx';
import { utils } from 'aes-js';
import { KeyPair } from '../../crypto/keypair';
import { ZILLIQA } from '../../config/slip44';

const CHAIN_ID = 42;
const SHOULD_BE_BYTES = '088180a80110011a14ebd8b370dddb636faf641040d2181c55190840fb22230a2103150a7f37063b134cde30070431a69148d60b252f4c7b38de33d813d329a7b7da2a120a100000000000000000000000000000000032120a100000000000000000000000000000000038a08d06';
const SHA512_SIZE = 64; 

describe('ZILTransaction encoding', () => {
  it('should encode Zilliqa transaction correctly', async () => {
    const SK = Uint8Array.from(utils.hex.toBytes("e93c035175b08613c4b0251ca92cd007026ca032ba53bafa3c839838f8b52d04"));
    const keypair = await KeyPair.fromPrivateKey(SK, ZILLIQA);
    const toAddr = Uint8Array.from(utils.hex.toBytes("EBd8b370Dddb636FAF641040D2181c55190840fb"));

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

    const txBytes = txReq.encode(keypair.pubKey);
    const encodedHex = utils.hex.fromBytes(txBytes);
    expect(encodedHex).toBe(SHOULD_BE_BYTES);

    const signature = txBytes.slice(0, SHA512_SIZE); 
    const txReceipt = new ZILTransactionReceipt(
      versionFromChainId(CHAIN_ID),
      BigInt(1),
      txReq.toProto(keypair.pubKey).gasprice!.data, 
      BigInt(100000),
      toAddr,
      txReq.toProto(keypair.pubKey).amount!.data, 
      keypair.pubKey,
      new Uint8Array(),
      new Uint8Array(),
      signature,
      false
    );

    const restoredReq = txReceipt.toRequest();
    const restoredBytes = restoredReq.encode(keypair.pubKey);
    const restoredHex = utils.hex.fromBytes(restoredBytes);

    expect(restoredHex).toBe(SHOULD_BE_BYTES);
    expect(restoredReq).toEqual(txReq);
  });
});
