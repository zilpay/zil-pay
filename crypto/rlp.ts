import { RLP } from "micro-eth-signer/core/rlp";
import type { TxType } from "micro-eth-signer/core/tx-internal";

const MAX_CHUNK_SIZE = 255;

export function safeChunkTransaction(
  transactionRlp: Uint8Array,
  derivationPath: Uint8Array,
  transactionType: TxType,
): Uint8Array[] {
  const payload = new Uint8Array([...derivationPath, ...transactionRlp]);

  if (payload.length <= MAX_CHUNK_SIZE) {
    return [payload];
  }

  if (transactionType === "legacy") {
    const decoded = RLP.decode(transactionRlp) as Uint8Array[];
    const vrs = decoded.slice(decoded.length - 3);

    const encodedVrs = RLP.encode(vrs);
    const encodedVrsPayload = encodedVrs.slice(1);

    let chunkSize = MAX_CHUNK_SIZE;
    const lastChunkLen = payload.length % MAX_CHUNK_SIZE;

    if (lastChunkLen !== 0 && lastChunkLen <= encodedVrsPayload.length) {
      for (let i = 1; i <= MAX_CHUNK_SIZE; i++) {
        const proposedSize = MAX_CHUNK_SIZE - i;
        if (proposedSize === 0) {
          continue;
        }

        const newLastChunkLen = payload.length % proposedSize;
        if (
          newLastChunkLen === 0 ||
          newLastChunkLen > encodedVrsPayload.length
        ) {
          chunkSize = proposedSize;
          break;
        }
      }
    }

    const chunks: Uint8Array[] = [];
    for (let i = 0; i < payload.length; i += chunkSize) {
      chunks.push(payload.slice(i, i + chunkSize));
    }
    return chunks;
  }

  const chunks: Uint8Array[] = [];
  for (let i = 0; i < payload.length; i += MAX_CHUNK_SIZE) {
    chunks.push(payload.slice(i, i + MAX_CHUNK_SIZE));
  }
  return chunks;
}
