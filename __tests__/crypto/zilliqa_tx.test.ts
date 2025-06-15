import { describe, it, expect } from 'vitest';
import { ZILTransactionRequest, ZILTransactionReceipt } from '../../crypto/zilliqa_tx';
import { utils } from 'aes-js';
import { KeyPair } from '../../crypto/keypair';
import { ZILLIQA } from '../../config/slip44';
import { encodeProtoTransactionCoreInfo } from '../../crypto/proto/zq1';

const CHAIN_ID = 42;
const SHOULD_BE_BYTES = '088180a80110011a14ebd8b370dddb636faf641040d2181c55190840fb22230a2103150a7f37063b134cde30070431a69148d60b252f4c7b38de33d813d329a7b7da2a120a100000000000000000000000000000000032120a100000000000000000000000000000000038a08d06';

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

    const txReceipt = await txReq.sign(keypair);
    const proto = txReceipt.toProto();
    const restoredBytes = encodeProtoTransactionCoreInfo(proto);
    const restoredHex = utils.hex.fromBytes(restoredBytes);

    expect(restoredHex).toBe(SHOULD_BE_BYTES);
  });
});

describe('ZILTransactionReceipt verify', () => {
  it('should verify a valid signature', async () => {
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

    const txReceipt = await txReq.sign(keypair);
    const isValid = await txReceipt.verify();

    expect(isValid).toBe(true);
  });

  it('should fail verification with an invalid signature', async () => {
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

    const txReceipt = await txReq.sign(keypair);
    // Create an invalid signature by modifying the original
    const invalidSignature = new Uint8Array(txReceipt.signature);
    invalidSignature[0] ^= 0xff; // Flip first byte

    const invalidReceipt = new ZILTransactionReceipt(
      txReceipt.version,
      txReceipt.nonce,
      txReceipt.gasPrice,
      txReceipt.gasLimit,
      txReceipt.toAddr,
      txReceipt.amount,
      txReceipt.pubKey,
      txReceipt.code,
      txReceipt.data,
      invalidSignature,
      txReceipt.priority
    );

    const isValid = await invalidReceipt.verify();
    expect(isValid).toBe(false);
  });
});
