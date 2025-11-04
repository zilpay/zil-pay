import { concatUint8Arrays } from 'lib/utils/bytes';
import { RLP } from 'micro-eth-signer';
import type { TxType } from 'micro-eth-signer/core/tx-internal';

export function safeChunkTransaction(
    transactionRlp: Uint8Array,
    derivationPath: Uint8Array,
    transactionType?: TxType,
): Uint8Array[] {
    const MAX_CHUNK_SIZE = 255;
    const payload = concatUint8Arrays(derivationPath, transactionRlp);

    if (payload.length <= MAX_CHUNK_SIZE) {
        return [payload];
    }

    if (transactionType) {
        const chunks: Uint8Array[] = [];
        for (let i = 0; i < payload.length; i += MAX_CHUNK_SIZE) {
            chunks.push(payload.subarray(i, i + MAX_CHUNK_SIZE));
        }
        return chunks;
    }

    const decodedItems = RLP.decode(transactionRlp) as (
        | Uint8Array
        | Uint8Array[]
    )[];
    const decodedVRS = decodedItems.slice(-3);
    const encodedVrsList = RLP.encode(decodedVRS);
    const encodedVrsPayload = encodedVrsList.subarray(1);

    let chunkSize = 0;
    const lastChunkSizeDefault = payload.length % MAX_CHUNK_SIZE;

    if (
        lastChunkSizeDefault === 0 ||
        lastChunkSizeDefault > encodedVrsPayload.length
    ) {
        chunkSize = MAX_CHUNK_SIZE;
    } else {
        for (let i = 1; i <= MAX_CHUNK_SIZE; i++) {
            const smallerChunkSize = MAX_CHUNK_SIZE - i;

            if (smallerChunkSize <= 0) {
                continue;
            }

            const newLastChunkSize = payload.length % smallerChunkSize;
            if (
                newLastChunkSize === 0 ||
                newLastChunkSize > encodedVrsPayload.length
            ) {
                chunkSize = smallerChunkSize;
                break;
            }
        }
    }

    const chunks: Uint8Array[] = [];
    for (let i = 0; i < payload.length; i += chunkSize) {
        chunks.push(payload.subarray(i, i + chunkSize));
    }

    return chunks;
}
