export interface ByteArray {
  data: Uint8Array;
}

export function encodeByteArray(message: ByteArray): Uint8Array {
  let bb = popByteBuffer();
  _encodeByteArray(message, bb);
  return toUint8Array(bb);
}

function _encodeByteArray(message: ByteArray, bb: ByteBuffer): void {
  // required bytes data = 1;
  let $data = message.data;
  if ($data !== undefined) {
    writeVarint32(bb, 10);
    writeVarint32(bb, $data.length), writeBytes(bb, $data);
  }
}

export function decodeByteArray(binary: Uint8Array): ByteArray {
  return _decodeByteArray(wrapByteBuffer(binary));
}

function _decodeByteArray(bb: ByteBuffer): ByteArray {
  let message: ByteArray = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // required bytes data = 1;
      case 1: {
        message.data = readBytes(bb, readVarint32(bb));
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  if (message.data === undefined)
    throw new Error("Missing required field: data");

  return message;
}

export interface ProtoTransactionCoreInfo {
  version?: number;
  nonce?: Long;
  toaddr?: Uint8Array;
  senderpubkey?: ByteArray;
  amount?: ByteArray;
  gasprice?: ByteArray;
  gaslimit?: Long;
  code?: Uint8Array;
  data?: Uint8Array;
}

export function encodeProtoTransactionCoreInfo(message: ProtoTransactionCoreInfo): Uint8Array {
  let bb = popByteBuffer();
  _encodeProtoTransactionCoreInfo(message, bb);
  return toUint8Array(bb);
}

function _encodeProtoTransactionCoreInfo(message: ProtoTransactionCoreInfo, bb: ByteBuffer): void {
  // optional uint32 version = 1;
  let $version = message.version;
  if ($version !== undefined) {
    writeVarint32(bb, 8);
    writeVarint32(bb, $version);
  }

  // optional uint64 nonce = 2;
  let $nonce = message.nonce;
  if ($nonce !== undefined) {
    writeVarint32(bb, 16);
    writeVarint64(bb, $nonce);
  }

  // optional bytes toaddr = 3;
  let $toaddr = message.toaddr;
  if ($toaddr !== undefined) {
    writeVarint32(bb, 26);
    writeVarint32(bb, $toaddr.length), writeBytes(bb, $toaddr);
  }

  // optional ByteArray senderpubkey = 4;
  let $senderpubkey = message.senderpubkey;
  if ($senderpubkey !== undefined) {
    writeVarint32(bb, 34);
    let nested = popByteBuffer();
    _encodeByteArray($senderpubkey, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional ByteArray amount = 5;
  let $amount = message.amount;
  if ($amount !== undefined) {
    writeVarint32(bb, 42);
    let nested = popByteBuffer();
    _encodeByteArray($amount, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional ByteArray gasprice = 6;
  let $gasprice = message.gasprice;
  if ($gasprice !== undefined) {
    writeVarint32(bb, 50);
    let nested = popByteBuffer();
    _encodeByteArray($gasprice, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional uint64 gaslimit = 7;
  let $gaslimit = message.gaslimit;
  if ($gaslimit !== undefined) {
    writeVarint32(bb, 56);
    writeVarint64(bb, $gaslimit);
  }

  // optional bytes code = 8;
  let $code = message.code;
  if ($code !== undefined) {
    writeVarint32(bb, 66);
    writeVarint32(bb, $code.length), writeBytes(bb, $code);
  }

  // optional bytes data = 9;
  let $data = message.data;
  if ($data !== undefined) {
    writeVarint32(bb, 74);
    writeVarint32(bb, $data.length), writeBytes(bb, $data);
  }
}

export function decodeProtoTransactionCoreInfo(binary: Uint8Array): ProtoTransactionCoreInfo {
  return _decodeProtoTransactionCoreInfo(wrapByteBuffer(binary));
}

function _decodeProtoTransactionCoreInfo(bb: ByteBuffer): ProtoTransactionCoreInfo {
  let message: ProtoTransactionCoreInfo = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional uint32 version = 1;
      case 1: {
        message.version = readVarint32(bb) >>> 0;
        break;
      }

      // optional uint64 nonce = 2;
      case 2: {
        message.nonce = readVarint64(bb, /* unsigned */ true);
        break;
      }

      // optional bytes toaddr = 3;
      case 3: {
        message.toaddr = readBytes(bb, readVarint32(bb));
        break;
      }

      // optional ByteArray senderpubkey = 4;
      case 4: {
        let limit = pushTemporaryLength(bb);
        message.senderpubkey = _decodeByteArray(bb);
        bb.limit = limit;
        break;
      }

      // optional ByteArray amount = 5;
      case 5: {
        let limit = pushTemporaryLength(bb);
        message.amount = _decodeByteArray(bb);
        bb.limit = limit;
        break;
      }

      // optional ByteArray gasprice = 6;
      case 6: {
        let limit = pushTemporaryLength(bb);
        message.gasprice = _decodeByteArray(bb);
        bb.limit = limit;
        break;
      }

      // optional uint64 gaslimit = 7;
      case 7: {
        message.gaslimit = readVarint64(bb, /* unsigned */ true);
        break;
      }

      // optional bytes code = 8;
      case 8: {
        message.code = readBytes(bb, readVarint32(bb));
        break;
      }

      // optional bytes data = 9;
      case 9: {
        message.data = readBytes(bb, readVarint32(bb));
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface ProtoTransaction {
  tranid?: Uint8Array;
  info?: ProtoTransactionCoreInfo;
  signature?: ByteArray;
}

export function encodeProtoTransaction(message: ProtoTransaction): Uint8Array {
  let bb = popByteBuffer();
  _encodeProtoTransaction(message, bb);
  return toUint8Array(bb);
}

function _encodeProtoTransaction(message: ProtoTransaction, bb: ByteBuffer): void {
  // optional bytes tranid = 1;
  let $tranid = message.tranid;
  if ($tranid !== undefined) {
    writeVarint32(bb, 10);
    writeVarint32(bb, $tranid.length), writeBytes(bb, $tranid);
  }

  // optional ProtoTransactionCoreInfo info = 2;
  let $info = message.info;
  if ($info !== undefined) {
    writeVarint32(bb, 18);
    let nested = popByteBuffer();
    _encodeProtoTransactionCoreInfo($info, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional ByteArray signature = 3;
  let $signature = message.signature;
  if ($signature !== undefined) {
    writeVarint32(bb, 26);
    let nested = popByteBuffer();
    _encodeByteArray($signature, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }
}

export function decodeProtoTransaction(binary: Uint8Array): ProtoTransaction {
  return _decodeProtoTransaction(wrapByteBuffer(binary));
}

function _decodeProtoTransaction(bb: ByteBuffer): ProtoTransaction {
  let message: ProtoTransaction = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional bytes tranid = 1;
      case 1: {
        message.tranid = readBytes(bb, readVarint32(bb));
        break;
      }

      // optional ProtoTransactionCoreInfo info = 2;
      case 2: {
        let limit = pushTemporaryLength(bb);
        message.info = _decodeProtoTransactionCoreInfo(bb);
        bb.limit = limit;
        break;
      }

      // optional ByteArray signature = 3;
      case 3: {
        let limit = pushTemporaryLength(bb);
        message.signature = _decodeByteArray(bb);
        bb.limit = limit;
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface ProtoTransactionReceipt {
  receipt?: Uint8Array;
  cumgas?: Long;
}

export function encodeProtoTransactionReceipt(message: ProtoTransactionReceipt): Uint8Array {
  let bb = popByteBuffer();
  _encodeProtoTransactionReceipt(message, bb);
  return toUint8Array(bb);
}

function _encodeProtoTransactionReceipt(message: ProtoTransactionReceipt, bb: ByteBuffer): void {
  // optional bytes receipt = 1;
  let $receipt = message.receipt;
  if ($receipt !== undefined) {
    writeVarint32(bb, 10);
    writeVarint32(bb, $receipt.length), writeBytes(bb, $receipt);
  }

  // optional uint64 cumgas = 2;
  let $cumgas = message.cumgas;
  if ($cumgas !== undefined) {
    writeVarint32(bb, 16);
    writeVarint64(bb, $cumgas);
  }
}

export function decodeProtoTransactionReceipt(binary: Uint8Array): ProtoTransactionReceipt {
  return _decodeProtoTransactionReceipt(wrapByteBuffer(binary));
}

function _decodeProtoTransactionReceipt(bb: ByteBuffer): ProtoTransactionReceipt {
  let message: ProtoTransactionReceipt = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional bytes receipt = 1;
      case 1: {
        message.receipt = readBytes(bb, readVarint32(bb));
        break;
      }

      // optional uint64 cumgas = 2;
      case 2: {
        message.cumgas = readVarint64(bb, /* unsigned */ true);
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface ProtoTransactionWithReceipt {
  transaction?: ProtoTransaction;
  receipt?: ProtoTransactionReceipt;
}

export function encodeProtoTransactionWithReceipt(message: ProtoTransactionWithReceipt): Uint8Array {
  let bb = popByteBuffer();
  _encodeProtoTransactionWithReceipt(message, bb);
  return toUint8Array(bb);
}

function _encodeProtoTransactionWithReceipt(message: ProtoTransactionWithReceipt, bb: ByteBuffer): void {
  // optional ProtoTransaction transaction = 1;
  let $transaction = message.transaction;
  if ($transaction !== undefined) {
    writeVarint32(bb, 10);
    let nested = popByteBuffer();
    _encodeProtoTransaction($transaction, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }

  // optional ProtoTransactionReceipt receipt = 2;
  let $receipt = message.receipt;
  if ($receipt !== undefined) {
    writeVarint32(bb, 18);
    let nested = popByteBuffer();
    _encodeProtoTransactionReceipt($receipt, nested);
    writeVarint32(bb, nested.limit);
    writeByteBuffer(bb, nested);
    pushByteBuffer(nested);
  }
}

export function decodeProtoTransactionWithReceipt(binary: Uint8Array): ProtoTransactionWithReceipt {
  return _decodeProtoTransactionWithReceipt(wrapByteBuffer(binary));
}

function _decodeProtoTransactionWithReceipt(bb: ByteBuffer): ProtoTransactionWithReceipt {
  let message: ProtoTransactionWithReceipt = {} as any;

  end_of_message: while (!isAtEnd(bb)) {
    let tag = readVarint32(bb);

    switch (tag >>> 3) {
      case 0:
        break end_of_message;

      // optional ProtoTransaction transaction = 1;
      case 1: {
        let limit = pushTemporaryLength(bb);
        message.transaction = _decodeProtoTransaction(bb);
        bb.limit = limit;
        break;
      }

      // optional ProtoTransactionReceipt receipt = 2;
      case 2: {
        let limit = pushTemporaryLength(bb);
        message.receipt = _decodeProtoTransactionReceipt(bb);
        bb.limit = limit;
        break;
      }

      default:
        skipUnknownField(bb, tag & 7);
    }
  }

  return message;
}

export interface Long {
  low: number;
  high: number;
  unsigned: boolean;
}

interface ByteBuffer {
  bytes: Uint8Array;
  offset: number;
  limit: number;
}

function pushTemporaryLength(bb: ByteBuffer): number {
  let length = readVarint32(bb);
  let limit = bb.limit;
  bb.limit = bb.offset + length;
  return limit;
}

function skipUnknownField(bb: ByteBuffer, type: number): void {
  switch (type) {
    case 0: while (readByte(bb) & 0x80) { } break;
    case 2: skip(bb, readVarint32(bb)); break;
    case 5: skip(bb, 4); break;
    case 1: skip(bb, 8); break;
    default: throw new Error("Unimplemented type: " + type);
  }
}

// The code below was modified from https://github.com/protobufjs/bytebuffer.js
// which is under the Apache License 2.0.

let bbStack: ByteBuffer[] = [];

function popByteBuffer(): ByteBuffer {
  const bb = bbStack.pop();
  if (!bb) return { bytes: new Uint8Array(64), offset: 0, limit: 0 };
  bb.offset = bb.limit = 0;
  return bb;
}

function pushByteBuffer(bb: ByteBuffer): void {
  bbStack.push(bb);
}

function wrapByteBuffer(bytes: Uint8Array): ByteBuffer {
  return { bytes, offset: 0, limit: bytes.length };
}

function toUint8Array(bb: ByteBuffer): Uint8Array {
  let bytes = bb.bytes;
  let limit = bb.limit;
  return bytes.length === limit ? bytes : bytes.subarray(0, limit);
}

function skip(bb: ByteBuffer, offset: number): void {
  if (bb.offset + offset > bb.limit) {
    throw new Error('Skip past limit');
  }
  bb.offset += offset;
}

function isAtEnd(bb: ByteBuffer): boolean {
  return bb.offset >= bb.limit;
}

function grow(bb: ByteBuffer, count: number): number {
  let bytes = bb.bytes;
  let offset = bb.offset;
  let limit = bb.limit;
  let finalOffset = offset + count;
  if (finalOffset > bytes.length) {
    let newBytes = new Uint8Array(finalOffset * 2);
    newBytes.set(bytes);
    bb.bytes = newBytes;
  }
  bb.offset = finalOffset;
  if (finalOffset > limit) {
    bb.limit = finalOffset;
  }
  return offset;
}

function advance(bb: ByteBuffer, count: number): number {
  let offset = bb.offset;
  if (offset + count > bb.limit) {
    throw new Error('Read past limit');
  }
  bb.offset += count;
  return offset;
}

function readBytes(bb: ByteBuffer, count: number): Uint8Array {
  let offset = advance(bb, count);
  return bb.bytes.subarray(offset, offset + count);
}

function writeBytes(bb: ByteBuffer, buffer: Uint8Array): void {
  let offset = grow(bb, buffer.length);
  bb.bytes.set(buffer, offset);
}



function writeByteBuffer(bb: ByteBuffer, buffer: ByteBuffer): void {
  let offset = grow(bb, buffer.limit);
  let from = bb.bytes;
  let to = buffer.bytes;

  // This for loop is much faster than subarray+set on V8
  for (let i = 0, n = buffer.limit; i < n; i++) {
    from[i + offset] = to[i];
  }
}

function readByte(bb: ByteBuffer): number {
  return bb.bytes[advance(bb, 1)];
}

function writeByte(bb: ByteBuffer, value: number): void {
  let offset = grow(bb, 1);
  bb.bytes[offset] = value;
}
function readVarint32(bb: ByteBuffer): number {
  let c = 0;
  let value = 0;
  let b: number;
  do {
    b = readByte(bb);
    if (c < 32) value |= (b & 0x7F) << c;
    c += 7;
  } while (b & 0x80);
  return value;
}

function writeVarint32(bb: ByteBuffer, value: number): void {
  value >>>= 0;
  while (value >= 0x80) {
    writeByte(bb, (value & 0x7f) | 0x80);
    value >>>= 7;
  }
  writeByte(bb, value);
}

function readVarint64(bb: ByteBuffer, unsigned: boolean): Long {
  let part0 = 0;
  let part1 = 0;
  let part2 = 0;
  let b: number;

  b = readByte(bb); part0 = (b & 0x7F); if (b & 0x80) {
    b = readByte(bb); part0 |= (b & 0x7F) << 7; if (b & 0x80) {
      b = readByte(bb); part0 |= (b & 0x7F) << 14; if (b & 0x80) {
        b = readByte(bb); part0 |= (b & 0x7F) << 21; if (b & 0x80) {

          b = readByte(bb); part1 = (b & 0x7F); if (b & 0x80) {
            b = readByte(bb); part1 |= (b & 0x7F) << 7; if (b & 0x80) {
              b = readByte(bb); part1 |= (b & 0x7F) << 14; if (b & 0x80) {
                b = readByte(bb); part1 |= (b & 0x7F) << 21; if (b & 0x80) {

                  b = readByte(bb); part2 = (b & 0x7F); if (b & 0x80) {
                    b = readByte(bb); part2 |= (b & 0x7F) << 7;
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return {
    low: part0 | (part1 << 28),
    high: (part1 >>> 4) | (part2 << 24),
    unsigned,
  };
}

function writeVarint64(bb: ByteBuffer, value: Long): void {
  let part0 = value.low >>> 0;
  let part1 = ((value.low >>> 28) | (value.high << 4)) >>> 0;
  let part2 = value.high >>> 24;

  // ref: src/google/protobuf/io/coded_stream.cc
  let size =
    part2 === 0 ?
      part1 === 0 ?
        part0 < 1 << 14 ?
          part0 < 1 << 7 ? 1 : 2 :
          part0 < 1 << 21 ? 3 : 4 :
        part1 < 1 << 14 ?
          part1 < 1 << 7 ? 5 : 6 :
          part1 < 1 << 21 ? 7 : 8 :
      part2 < 1 << 7 ? 9 : 10;

  let offset = grow(bb, size);
  let bytes = bb.bytes;

  switch (size) {
    case 10: bytes[offset + 9] = (part2 >>> 7) & 0x01;
    case 9: bytes[offset + 8] = size !== 9 ? part2 | 0x80 : part2 & 0x7F;
    case 8: bytes[offset + 7] = size !== 8 ? (part1 >>> 21) | 0x80 : (part1 >>> 21) & 0x7F;
    case 7: bytes[offset + 6] = size !== 7 ? (part1 >>> 14) | 0x80 : (part1 >>> 14) & 0x7F;
    case 6: bytes[offset + 5] = size !== 6 ? (part1 >>> 7) | 0x80 : (part1 >>> 7) & 0x7F;
    case 5: bytes[offset + 4] = size !== 5 ? part1 | 0x80 : part1 & 0x7F;
    case 4: bytes[offset + 3] = size !== 4 ? (part0 >>> 21) | 0x80 : (part0 >>> 21) & 0x7F;
    case 3: bytes[offset + 2] = size !== 3 ? (part0 >>> 14) | 0x80 : (part0 >>> 14) & 0x7F;
    case 2: bytes[offset + 1] = size !== 2 ? (part0 >>> 7) | 0x80 : (part0 >>> 7) & 0x7F;
    case 1: bytes[offset] = size !== 1 ? part0 | 0x80 : part0 & 0x7F;
    default: break;
  }
}
