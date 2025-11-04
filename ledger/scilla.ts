import Transport from './transport';
import { hexToUint8Array, uint8ArrayToHex } from 'lib/utils/hex';
import { uint8ArrayToUtf8 } from 'lib/utils/utf8';
import { writeInt32LE, concatUint8Arrays } from 'lib/utils/bytes';
import type { LedgerPublicAddress, MessagePayload } from 'types/ledger';

const CLA = 0xe0;
const INS = {
  getVersion: 0x01,
  getPublickKey: 0x02,
  getPublicAddress: 0x02,
  signTxn: 0x04,
  signHash: 0x08,
};
const PUB_KEY_BYTE_LEN = 33;
const SIG_BYTE_LEN = 64;
const HASH_BYTE_LEN = 32;
const BECH32_ADDR_LEN = 'zil'.length + 1 + 32 + 6;

export class ScillaLedgerInterface {
  #transport: Transport;

  constructor(transport: Transport, scrambleKey = 'w0w') {
    this.#transport = transport;
    transport.decorateAppAPIMethods(
      this,
      ['getVersion', 'getPublicKey', 'getPublicAddress', 'signHash', 'signTxn'],
      scrambleKey
    );
  }

  public async getVersion(): Promise<string> {
    const P1 = 0x00;
    const P2 = 0x00;

    const response = await this.#transport.send(CLA, INS.getVersion, P1, P2);

    if (response[3] != 144 && response[4] != 0) {
      throw new Error("invalid version");
    }

    return `v${response[0]}.${response[1]}.${response[2]}`;
  }

  public async getPublicKey(index: number): Promise<string> {
    const P1 = 0x00;
    const P2 = 0x00;

    const payload = new Uint8Array(4);
    writeInt32LE(payload, index);

    const response = await this.#transport.send(CLA, INS.getPublickKey, P1, P2, payload);
    return uint8ArrayToHex(response).slice(0, PUB_KEY_BYTE_LEN * 2);
  }

  public async getPublicAddress(index: number): Promise<LedgerPublicAddress> {
    const P1 = 0x00;
    const P2 = 0x01;

    const payload = new Uint8Array(4);
    writeInt32LE(payload, index);

    const response = await this.#transport.send(CLA, INS.getPublicAddress, P1, P2, payload);
    const pubAddr = uint8ArrayToUtf8(
      response.subarray(PUB_KEY_BYTE_LEN, PUB_KEY_BYTE_LEN + BECH32_ADDR_LEN),
    );
    const publicKey = uint8ArrayToHex(response).slice(0, PUB_KEY_BYTE_LEN * 2);
    return { pubAddr, publicKey, index, name: "" };
  }

  public async signHash(index: number, message: MessagePayload): Promise<string> {
    const P1 = 0x00;
    const P2 = 0x00;
    const indexBytes = new Uint8Array(4);
    writeInt32LE(indexBytes, index);
    const hashBytes = hexToUint8Array(message.hash);
    const hashLen = hashBytes.length;

    if (hashLen === 0) {
      throw new Error(`Hash length ${hashLen} is invalid`);
    }

    const finalHashBytes = hashLen > HASH_BYTE_LEN
      ? hashBytes.subarray(0, HASH_BYTE_LEN)
      : hashBytes;

    const payload = concatUint8Arrays(indexBytes, finalHashBytes);
    const result = await this.#transport.send(CLA, INS.signHash, P1, P2, payload);
    return uint8ArrayToHex(result).slice(0, SIG_BYTE_LEN * 2);
  }

  public async signTxn(index: number, txnBytes: Uint8Array): Promise<string> {
    const P1 = 0x00;
    const P2 = 0x00;

    const indexBytes = new Uint8Array(4);
    writeInt32LE(indexBytes, index);

    const STREAM_LEN = 128;
    let txn1Bytes: Uint8Array;
    let remainingBytes: Uint8Array;

    if (txnBytes.length > STREAM_LEN) {
      txn1Bytes = txnBytes.subarray(0, STREAM_LEN);
      remainingBytes = txnBytes.subarray(STREAM_LEN);
    } else {
      txn1Bytes = txnBytes;
      remainingBytes = new Uint8Array(0);
    }

    const txn1SizeBytes = new Uint8Array(4);
    writeInt32LE(txn1SizeBytes, txn1Bytes.length);
    const hostBytesLeftBytes = new Uint8Array(4);
    writeInt32LE(hostBytesLeftBytes, remainingBytes.length);

    const payload = concatUint8Arrays(
      indexBytes,
      hostBytesLeftBytes,
      txn1SizeBytes,
      txn1Bytes
    );

    const transport = this.#transport;
    return transport
      .send(CLA, INS.signTxn, P1, P2, payload)
      .then(function cb(response: Uint8Array): Promise<Uint8Array> | Uint8Array {
        if (remainingBytes.length > 0) {
          let txnNBytes: Uint8Array;
          if (remainingBytes.length > STREAM_LEN) {
            txnNBytes = remainingBytes.subarray(0, STREAM_LEN);
            remainingBytes = remainingBytes.subarray(STREAM_LEN);
          } else {
            txnNBytes = remainingBytes;
            remainingBytes = new Uint8Array(0);
          }

          const txnNSizeBytes = new Uint8Array(4);
          writeInt32LE(txnNSizeBytes, txnNBytes.length);
          writeInt32LE(hostBytesLeftBytes, remainingBytes.length);
          const payload = concatUint8Arrays(hostBytesLeftBytes, txnNSizeBytes, txnNBytes);
          return transport.send(CLA, INS.signTxn, P1, P2, payload).then(cb);
        }
        return response;
      })
      .then((result) => {
        return uint8ArrayToHex(result).slice(0, SIG_BYTE_LEN * 2);
      });
  }
}
