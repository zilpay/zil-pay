import { describe, it, expect } from "vitest";
import {
  TransactionRequest,
  SignedTransaction,
} from "../../crypto/tx";
import { KeyPair } from "../../crypto/keypair";
import { ZILLIQA, ETHEREUM } from "../../config/slip44";
import { ZILTransactionRequest } from "../../crypto/zilliqa_tx";
import { Transaction, weieth, weigwei } from "micro-eth-signer";
import { hexToUint8Array } from "../../lib/utils/hex";
import type { TransactionMetadata } from "../../types/tx";


describe("TransactionRequest and TransactionReceipt", () => {
  const metadata: TransactionMetadata = {
    chainHash: 123,
    token: {
        balances: undefined,
        value: "0",
        recipient: "0xtest",
    }
  };

  it("should correctly sign and verify a Scilla transaction", async () => {
    const keypair = await KeyPair.generate(ZILLIQA);
    const toAddr = hexToUint8Array(
      "0x1234567890123456789012345678901234567890",
    );
    const scillaTxReq = new ZILTransactionRequest(
      333,
      1n,
      2000000000n,
      100n,
      toAddr,
      1000000000000n,
    );
    const request = new TransactionRequest(metadata, scillaTxReq);
    const receipt = await request.sign(keypair);

    expect(receipt).toBeInstanceOf(SignedTransaction);
    expect(receipt.scilla).toBeDefined();
    expect(receipt.evm).toBeUndefined();

    const isValid = await receipt.verify();
    expect(isValid).toBe(true);
  });

  it("should correctly sign and verify an EVM transaction", async () => {
    const keypair = await KeyPair.generate(ETHEREUM);
    const evmTx = Transaction.prepare({
      to: "0xAEC7595CA9A57be828493bb73f07fA335a85B41d",
      value: weieth.decode("1.1"),
      maxFeePerGas: weigwei.decode("100"),
      nonce: 0n,
    });
    const request = new TransactionRequest(metadata, undefined, evmTx);
    const receipt = await request.sign(keypair);

    expect(receipt).toBeInstanceOf(SignedTransaction);
    expect(receipt.evm).toBeDefined();
    expect(receipt.scilla).toBeUndefined();

    const isValid = await receipt.verify();
    expect(isValid).toBe(true);
  });

  it("should throw an error when signing with an invalid transaction type", async () => {
    const keypair = await KeyPair.generate(ETHEREUM);
    const request = new TransactionRequest(metadata, undefined, undefined);

    await expect(request.sign(keypair)).rejects.toThrow("Invlid tx type");
  });

  it("should throw an error when verifying an invalid transaction type", async () => {
    const receipt = new SignedTransaction(metadata, undefined, undefined);

    await expect(receipt.verify()).rejects.toThrow("Invlid tx type");
  });
});
