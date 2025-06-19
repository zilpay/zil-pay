import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  HistoricalTransaction,
  TransactionStatus,
  ChainType,
} from '../../background/rpc/history_tx';
import {
  TransactionReceipt,
  TransactionMetadata,
  TransactionRequest,
} from '../../crypto/tx';
import { ZILTransactionReceipt, ZILTransactionRequest } from '../../crypto/zilliqa_tx';
import { hexToUint8Array, uint8ArrayToHex } from '../../lib/utils/hex';
import { utf8ToUint8Array } from '../../lib/utils/utf8';
import { Address } from '../../crypto/address';
import { KeyPair } from '../../crypto/keypair';
import { createZilliqaConfig } from '../data';
import { randomBytes } from '../../crypto/random';

const MOCK_TIMESTAMP = 1740000000000;
const MOCK_SENDER_PUBKEY = '030fba7ba5cfbf8b00dd6f3024153fc44ddda93727da58c99326eb0edd08195cdb';
const MOCK_RECIPIENT_ADDR = '0x0089d53f703f7e0843953d48133f74ce247184c2';
const MOCK_TX_HASH = '0x' + 'a'.repeat(64);

describe('HistoricalTransaction', () => {
  const ZIL_CONFIG = createZilliqaConfig();
  describe('fromReceipt', () => {
    describe('Scilla Transactions', () => {
      it('should set contract_address for a Scilla contract call', async () => {
        const keypair = await KeyPair.generate(ZIL_CONFIG.slip44);
        const toAddr = Address.fromStr("zil1g0n2tsqwyht7xafsmdgq2zrwwt7nnz5arcp2xw");
        const data = JSON.stringify({
          "_tag": "Transfer",
          "params": [
            {
              "vname": "to",
              "type": "ByStr20",
              "value": "0x066b88d3411c68cb56219e748ae895e1734c0f51"
            },
            {
              "vname": "amount",
              "type": "Uint128",
              "value": "355940000000000000000"
            }
          ]
        });
        const txZilReq = new ZILTransactionRequest(
          42,
          BigInt(1),
          BigInt(2000) * BigInt(10 ** 6),
          BigInt(100000),
          toAddr.bytes,
          BigInt(1) * BigInt(10 ** 12),
          new Uint8Array(),
          utf8ToUint8Array(data),
        );
        const metadata = {
          chainHash: 0,
        };
        const txReq = new TransactionRequest(metadata, txZilReq);
        const receipt = await txReq.sign(keypair);

        receipt.metadata.hash = uint8ArrayToHex(randomBytes(64));

        const historicalTx = await HistoricalTransaction.fromReceipt(receipt);

       expect(historicalTx).toBeInstanceOf(HistoricalTransaction);
        expect(historicalTx.transaction_hash).toBeDefined();
        expect(historicalTx.amount).toBe(1000000000000n);
        expect(historicalTx.sender).toEqual(uint8ArrayToHex(keypair.pubKey));
        expect(historicalTx.recipient).toBe("zil1g0n2tsqwyht7xafsmdgq2zrwwt7nnz5arcp2xw");
        expect(historicalTx.contract_address).toBe("zil1g0n2tsqwyht7xafsmdgq2zrwwt7nnz5arcp2xw");
        expect(historicalTx.status).toBe(TransactionStatus.Pending);
        expect(historicalTx.status_code).toBeNull();
        expect(historicalTx.timestamp).toBeDefined();
        expect(historicalTx.block_number).toBeNull();
        expect(historicalTx.gas_used).toBeNull();
        expect(historicalTx.gas_limit).toBe(100000n);
        expect(historicalTx.gas_price).toBe(2000000000n);
        expect(historicalTx.effective_gas_price).toBeNull();
        expect(historicalTx.fee).toBe(200000000000000n);
        expect(historicalTx.icon).toBeNull();
        expect(historicalTx.title).toBeNull();
        expect(historicalTx.error).toBeNull();
        expect(historicalTx.sig).toBeDefined();
        expect(historicalTx.nonce).toBe(1n);
        expect(historicalTx.token_info).toBeNull();
        expect(historicalTx.chain_type).toBe('Scilla' as ChainType);
        expect(historicalTx.chain_hash).toBe(0);
      });
    });
  });
});

