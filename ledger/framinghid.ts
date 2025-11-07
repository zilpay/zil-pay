import { TransportError } from "@ledgerhq/errors";
import {
  writeUInt16BE,
  readUInt16BE,
  concatUint8Arrays,
} from "lib/utils/bytes";

type ResponseAcc =
  | {
      data: Uint8Array;
      dataLength: number;
      sequence: number;
    }
  | null
  | undefined;

const TAG = 0x05;

const asUInt16BE = (value: number): Uint8Array => {
  const b = new Uint8Array(2);
  writeUInt16BE(b, value, 0);
  return b;
};

const initialAcc = {
  data: new Uint8Array(0),
  dataLength: 0,
  sequence: 0,
};

export default function hidFraming(channel: number, packetSize: number) {
  return {
    makeBlocks(apdu: Uint8Array): Uint8Array[] {
      let data = concatUint8Arrays(asUInt16BE(apdu.length), apdu);
      const blockSize = packetSize - 5;
      const nbBlocks = Math.ceil(data.length / blockSize);
      data = concatUint8Arrays(
        data,
        new Uint8Array(nbBlocks * blockSize - data.length + 1),
      );

      const blocks: Uint8Array[] = [];

      for (let i = 0; i < nbBlocks; i++) {
        const head = new Uint8Array(5);
        writeUInt16BE(head, channel, 0);
        head[2] = TAG;
        writeUInt16BE(head, i, 3);
        const chunk = data.subarray(i * blockSize, (i + 1) * blockSize);
        blocks.push(concatUint8Arrays(head, chunk));
      }

      return blocks;
    },

    reduceResponse(acc: ResponseAcc, chunk: Uint8Array): ResponseAcc {
      let { data, dataLength, sequence } = acc || initialAcc;

      if (readUInt16BE(chunk, 0) !== channel) {
        throw new TransportError("Invalid channel", "InvalidChannel");
      }

      if (chunk[2] !== TAG) {
        throw new TransportError("Invalid tag", "InvalidTag");
      }

      if (readUInt16BE(chunk, 3) !== sequence) {
        throw new TransportError("Invalid sequence", "InvalidSequence");
      }

      if (!acc) {
        dataLength = readUInt16BE(chunk, 5);
      }

      sequence++;
      const chunkData = chunk.subarray(acc ? 5 : 7);
      data = concatUint8Arrays(data, chunkData);

      if (data.length > dataLength) {
        data = data.subarray(0, dataLength);
      }

      return {
        data,
        dataLength,
        sequence,
      };
    },

    getReducedResult(acc: ResponseAcc): Uint8Array | null | undefined {
      if (acc && acc.dataLength === acc.data.length) {
        return acc.data;
      }
    },
  };
}
