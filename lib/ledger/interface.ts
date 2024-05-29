/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { Transaction } from 'core/background/services/transactions/tx-builder';
import type { MessagePayload } from 'types/transaction';
import type Transport from '@ledgerhq/hw-transport';
import { Buffer } from 'buffer';
import assert from 'assert';

const CLA = 0xE0;
const INS = {
  getVersion: 0x01,
  getPublickKey: 0x02,
  getPublicAddress: 0x02,
  signTxn: 0x04,
  signHash: 0x08
};
const PubKeyByteLen = 33;
const SigByteLen = 64;
const HashByteLen = 32;
const Bech32AddrLen = 'zil'.length + 1 + 32 + 6;

export class LedgerInterface {
  #transport: Transport;

  constructor(transport: Transport, scrambleKey = 'w0w') {
    this.#transport = transport;
    transport.decorateAppAPIMethods(
      this,
      ['getVersion', 'getPublicKey', 'getPublicAddress', 'signHash', 'signTxn'],
      scrambleKey
    );
  }

  public async getVersion() {
    const P1 = 0x00
    const P2 = 0x00

    const response = await this
      .#transport
      .send(CLA, INS.getVersion, P1, P2);
    let version = 'v';
    for (let i = 0; i < 3; ++i) {
      version += parseInt('0x' + response[i], 10);
      if (i !== 2) {
        version += '.';
      }
    }
    return {
      version
    };
  }

  public async getPublicKey(index: number) {
    const P1 = 0x00;
    const P2 = 0x00;

    const payload = Buffer.alloc(4);
    payload.writeInt32LE(index);

    const response = await this
      .#transport
      .send(CLA, INS.getPublickKey, P1, P2, payload);
    // The first PubKeyByteLen bytes are the public address.
    return response.toString('hex').slice(0, PubKeyByteLen * 2);
  }

  public async getPublicAddress(index: number) {
    const P1 = 0x00;
    const P2 = 0x01;

    const payload = Buffer.alloc(4);
    payload.writeInt32LE(index);

    const response = await this
      .#transport
      .send(CLA, INS.getPublicAddress, P1, P2, payload);
    // After the first PubKeyByteLen bytes, the remaining is the bech32 address string.
    const pubAddr = response
      .slice(PubKeyByteLen, PubKeyByteLen + Bech32AddrLen)
      .toString('utf-8');
    const publicKey = response.toString('hex').slice(0, PubKeyByteLen * 2);
    return { pubAddr, publicKey };
  }

  public async signHash(index: number, message: MessagePayload) {
    const P1 = 0x00;
    const P2 = 0x00;
    let indexBytes = Buffer.alloc(4);
    indexBytes.writeInt32LE(index);
    const hashBytes = Buffer.from(message.hash, 'hex');
    let hashLen = hashBytes.length;

    assert(hashLen > 0, `Hash length ${hashLen} is invalid`);

    if (hashLen > HashByteLen) {
      hashBytes.slice(0, HashByteLen)
    }

    const payload = Buffer.concat([indexBytes, hashBytes]);
    const result = await this
      .#transport
      .send(CLA, INS.signHash, P1, P2, payload);
    return (result.toString('hex').slice(0, SigByteLen * 2));
  }

  public signTxn(index: number, tx: Transaction): Promise<string> {
    // https://github.com/Zilliqa/Zilliqa-JavaScript-Library/tree/dev/packages/zilliqa-js-account#interfaces
    const P1 = 0x00;
    const P2 = 0x00;

    const indexBytes = Buffer.alloc(4);
    indexBytes.writeInt32LE(index);

    let txnBytes = tx.encodedProto();

    // Stream in batches of STREAM_LEN bytes each.
    const STREAM_LEN = 128;
    let txn1Bytes: Buffer | Uint8Array;
    if (txnBytes.length > STREAM_LEN) {
      txn1Bytes = txnBytes.slice(0, STREAM_LEN);
      txnBytes = txnBytes.slice(STREAM_LEN, undefined);
    } else {
      txn1Bytes = txnBytes;
      txnBytes = Buffer.alloc(0);
    }

    const txn1SizeBytes = Buffer.alloc(4);
    txn1SizeBytes.writeInt32LE(txn1Bytes.length);
    const hostBytesLeftBytes = Buffer.alloc(4);
    hostBytesLeftBytes.writeInt32LE(txnBytes.length);

    // See signTxn.c:handleSignTxn() for sequence details of payload.
    // 1. 4 bytes for indexBytes.
    // 2. 4 bytes for hostBytesLeftBytes.
    // 3. 4 bytes for txn1SizeBytes (number of bytes being sent now).
    // 4. txn1Bytes of actual data.
    const payload = Buffer.concat([
      indexBytes,
      hostBytesLeftBytes,
      txn1SizeBytes,
      txn1Bytes
    ]);

    const transport = this.#transport;
    return transport
      .send(CLA, INS.signTxn, P1, P2, payload)
      .then(function cb(response) {
        // Keep streaming data into the device till we run out of it.
        // See signTxn.c:istream_callback() for how this is used.
        // Each time the bytes sent consists of:
        //  1. 4-bytes of hostBytesLeftBytes.
        //  2. 4-bytes of txnNSizeBytes (number of bytes being sent now).
        //  3. txnNBytes of actual data.
        if (txnBytes.length > 0) {
          let txnNBytes: Buffer | Uint8Array;
          if (txnBytes.length > STREAM_LEN) {
            txnNBytes = txnBytes.slice(0, STREAM_LEN);
            txnBytes = txnBytes.slice(STREAM_LEN, undefined);
          } else {
            txnNBytes = txnBytes;
            txnBytes = Buffer.alloc(0);
          }

          const txnNSizeBytes = Buffer.alloc(4);
          txnNSizeBytes.writeInt32LE(txnNBytes.length);
          hostBytesLeftBytes.writeInt32LE(txnBytes.length);
          const payload = Buffer.concat([
            hostBytesLeftBytes,
            txnNSizeBytes,
            txnNBytes
          ]);
          return transport.send(CLA, INS.signTxn, P1, P2, payload).then(cb);
        }
        return response;
      })
      .then((result) => {
        return (result.toString('hex').slice(0, SigByteLen * 2));
      });
  }
}
