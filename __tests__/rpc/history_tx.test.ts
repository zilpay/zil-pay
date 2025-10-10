import { describe, it, expect } from "vitest";
import {
  HistoricalTransaction,
} from "../../background/rpc/history_tx";
import { generateErc20TransferData } from "../../background/rpc";
import { TransactionRequest } from "../../crypto/tx";
import { ZILTransactionRequest } from "../../crypto/zilliqa_tx";
import { uint8ArrayToHex } from "../../lib/utils/hex";
import { utf8ToUint8Array } from "../../lib/utils/utf8";
import { Address } from "../../crypto/address";
import { KeyPair } from "../../crypto/keypair";
import { createBscConfig, createZilliqaConfig } from "../data";
import { Transaction, weieth, weigwei } from "micro-eth-signer";
import type { TransactionMetadata } from '../../types/tx';

const ZIL_CONFIG = createZilliqaConfig();
const BSC_CONFIG = createBscConfig();

describe("HistoricalTransaction", () => {
  describe("fromReceipt", () => {
    describe("EVM Transactions", () => {
      it("should have props an EVM contract call", async () => {
        const keypair = await KeyPair.generate(BSC_CONFIG.slip44);
        const tokenAddress = Address.fromStr(
          "0x524bC91Dc82d6b90EF29F76A3ECAaBAffFD490Bc",
        );
        const recipient = Address.fromStr(
          "0x246C5881E3F109B2aF170F5C773EF969d3da581B",
        );
        const amount = weieth.decode("69");
        const transferData = generateErc20TransferData(
          await recipient.toEthChecksum(),
          amount,
        );
        const ethTx = Transaction.prepare({
          to: await tokenAddress.toEthChecksum(),
          value: 0n,
          // maxFeePerGas: weigwei.decode("1"),
          gasLimit: 24000n,
          // maxPriorityFeePerGas: 10n,
          nonce: 0n,
          gasPrice: 100n,
          chainId: BigInt(BSC_CONFIG.chainId),
          data: transferData,
          type: 'legacy',
        });
        const metadata = {
          chainHash: BSC_CONFIG.hash(),
        };
        const txReq = new TransactionRequest(metadata, undefined, ethTx);
        const receipt = await txReq.sign(keypair);

        console.log(receipt.evm);
      });
    });
  });
});

