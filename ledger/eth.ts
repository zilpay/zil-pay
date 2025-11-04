import Transport from './transport';
import { uint8ArrayToHex } from 'lib/utils/hex';
import { writeUInt32BE, concatUint8Arrays } from 'lib/utils/bytes';
import { uint8ArrayToUtf8 } from 'lib/utils/utf8';
import type { EthSignature, AppConfiguration, LedgerPublicAddress } from 'types/ledger';

const CLA = 0xe0;
const INS = {
  GET_PUBLIC_KEY: 0x02,
  SIGN_TRANSACTION: 0x04,
  GET_APP_CONFIGURATION: 0x06,
  SIGN_PERSONAL_MESSAGE: 0x08,
  SIGN_ETH_EIP_712: 0x0c,
};

const P1_FIRST_APDU = 0x00;
const P1_SUBSEQUENT_APDU = 0x80;

const MAX_APDU_PAYLOAD_SIZE = 250;

function bip32asUInt8Array(path: string): Uint8Array {
  const parts = path.split('/');
  const buffer = new Uint8Array(1 + parts.length * 4);
  buffer[0] = parts.length;
  parts.forEach((part, i) => {
    let value = parseInt(part, 10);
    if (part.endsWith("'")) {
      value = 0x80000000 | (value & ~0x80000000);
    }
    writeUInt32BE(buffer, value, 1 + i * 4);
  });
  return buffer;
}

export class EthLedgerInterface {
  #transport: Transport;

  constructor(transport: Transport, scrambleKey = 'ETH') {
    this.#transport = transport;

    this.#transport.decorateAppAPIMethods(
        this,
        [
          'getAppConfiguration',
          'getAddress',
          'signTransaction',
          'signPersonalMessage',
          'signEIP712Message',
        ],
        scrambleKey,
      );
  }

  async getAppConfiguration(): Promise<AppConfiguration> {
    const response = await this.#transport.send(CLA, INS.GET_APP_CONFIGURATION, 0x00, 0x00);

    const versionLength = response[1];
    const version = uint8ArrayToUtf8(response.subarray(2, 2 + versionLength));

    return { version };
  }

  async getAddress(path: string, boolDisplay = false): Promise<LedgerPublicAddress> {
    const pathParts = path.split('/');
    if (pathParts.length < 3) {
      throw new Error(`Invalid BIP-32 path for extracting index: ${path}`);
    }
    const index = parseInt(pathParts[2], 10);
    if (isNaN(index)) {
      throw new Error(`Could not parse index from BIP-32 path: ${path}`);
    }

    const pathBytes = bip32asUInt8Array(path);
    const P1 = boolDisplay ? 0x01 : 0x00;
    const P2 = 0x00;

    try {
      const response = await this.#transport.send(
        CLA,
        INS.GET_PUBLIC_KEY,
        P1,
        P2,
        pathBytes
      );
      console.log(`[LEDGER-ETH] getAddress <-`, { response: uint8ArrayToHex(response) });

      const publicKeyLength = response[0];
      const publicKey = uint8ArrayToHex(response.subarray(1, 1 + publicKeyLength));
      
      const addressOffset = 1 + publicKeyLength;
      const addressLength = response[addressOffset];
      const address = uint8ArrayToUtf8(response.subarray(addressOffset + 1, addressOffset + 1 + addressLength));
  
      const result: LedgerPublicAddress = {
        publicKey,
        pubAddr: address,
        index,
        name: '',
      };
      
      return result;

    } catch (err) {
      console.error(`[LEDGER-ETH] getAddress <- ERR`, err);
      throw err;
    }
  }
  
  async signTransaction(path: string, rlp: Uint8Array): Promise<EthSignature> {
    const pathBytes = bip32asUInt8Array(path);
    const payload = concatUint8Arrays(pathBytes, rlp);

    const chunks: Uint8Array[] = [];
    for (let offset = 0; offset < payload.length; offset += MAX_APDU_PAYLOAD_SIZE) {
      chunks.push(payload.subarray(offset, offset + MAX_APDU_PAYLOAD_SIZE));
    }

    let response: Uint8Array = new Uint8Array();
    for (let i = 0; i < chunks.length; i++) {
        const p1 = i === 0 ? P1_FIRST_APDU : P1_SUBSEQUENT_APDU;
        response = await this.#transport.send(CLA, INS.SIGN_TRANSACTION, p1, 0x00, chunks[i]);
    }
    
    const v = response[0];
    const r = uint8ArrayToHex(response.subarray(1, 1 + 32));
    const s = uint8ArrayToHex(response.subarray(1 + 32, 1 + 32 + 32));
  
    return { v, r, s };
  }

  async signPersonalMessage(path: string, message: Uint8Array): Promise<EthSignature> {
    const pathBytes = bip32asUInt8Array(path);
    
    const messageLengthBytes = new Uint8Array(4);
    writeUInt32BE(messageLengthBytes, message.length, 0);
    
    const payload = concatUint8Arrays(pathBytes, messageLengthBytes, message);

    const chunks: Uint8Array[] = [];
    for (let offset = 0; offset < payload.length; offset += MAX_APDU_PAYLOAD_SIZE) {
      chunks.push(payload.subarray(offset, offset + MAX_APDU_PAYLOAD_SIZE));
    }

    let response: Uint8Array = new Uint8Array();
    for (let i = 0; i < chunks.length; i++) {
        const p1 = i === 0 ? P1_FIRST_APDU : P1_SUBSEQUENT_APDU;
        response = await this.#transport.send(CLA, INS.SIGN_PERSONAL_MESSAGE, p1, 0x00, chunks[i]);
    }
    
    const v = response[0];
    const r = uint8ArrayToHex(response.subarray(1, 1 + 32));
    const s = uint8ArrayToHex(response.subarray(1 + 32, 1 + 32 + 32));
  
    return { v, r, s };
  }

  async signEIP712Message(path: string, domainHash: Uint8Array, messageHash: Uint8Array): Promise<EthSignature> {
    const pathBytes = bip32asUInt8Array(path);

    if (domainHash.length !== 32 || messageHash.length !== 32) {
      throw new Error("Hashes must be 32 bytes");
    }

    const payload = concatUint8Arrays(pathBytes, domainHash, messageHash);

    const response = await this.#transport.send(CLA, INS.SIGN_ETH_EIP_712, 0x00, 0x00, payload);

    const v = response[0];
    const r = uint8ArrayToHex(response.subarray(1, 1 + 32));
    const s = uint8ArrayToHex(response.subarray(1 + 32, 1 + 32 + 32));

    return { v, r, s };
  }
}
