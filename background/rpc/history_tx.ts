import { TransactionReceipt } from 'crypto/tx';
import { uint8ArrayToBigIntBigEndian } from 'crypto/number';
import { bigintToHex, HEX_PREFIX, uint8ArrayToHex } from 'lib/utils/hex';
import { Address, AddressType } from 'crypto/address';

export enum TransactionStatus {
  Pending,
  Success,
  Failed,
}

export type ChainType = "EVM" | "Scilla";

export interface TokenInfo {
  value: bigint;
  symbol: string;
  decimals: number;
}

export class HistoricalTransaction {
  public transaction_hash: string;
  public amount: bigint;
  public sender: string;
  public recipient: string;
  public contract_address: string | null;
  public status: TransactionStatus;
  public status_code: number | null;
  public timestamp: number;
  public block_number: bigint | null;
  public gas_used: bigint | null;
  public gas_limit: bigint | null;
  public gas_price: bigint | null;
  public blob_gas_used: bigint | null;
  public blob_gas_price: bigint | null;
  public effective_gas_price: bigint | null;
  public fee: bigint;
  public icon: string | null;
  public title: string | null;
  public error: string | null;
  public sig: string;
  public nonce: bigint;
  public token_info: TokenInfo | null;
  public chain_type: ChainType;
  public chain_hash: number;

  constructor(data: Omit<HistoricalTransaction, "constructor" | 'fromReceipt'>) {
    this.transaction_hash = data.transaction_hash;
    this.amount = data.amount;
    this.sender = data.sender;
    this.recipient = data.recipient;
    this.contract_address = data.contract_address;
    this.status = data.status;
    this.status_code = data.status_code;
    this.timestamp = data.timestamp;
    this.block_number = data.block_number;
    this.gas_used = data.gas_used;
    this.gas_limit = data.gas_limit;
    this.gas_price = data.gas_price;
    this.blob_gas_used = data.blob_gas_used;
    this.blob_gas_price = data.blob_gas_price;
    this.effective_gas_price = data.effective_gas_price;
    this.fee = data.fee;
    this.icon = data.icon;
    this.title = data.title;
    this.error = data.error;
    this.sig = data.sig;
    this.nonce = data.nonce;
    this.token_info = data.token_info;
    this.chain_type = data.chain_type;
    this.chain_hash = data.chain_hash;
  }

  public static async fromReceipt(
    receipt: TransactionReceipt
  ): Promise<HistoricalTransaction> {
    const { metadata } = receipt;

    if (!metadata.hash) {
      throw new Error("Invalid transaction hash");
    }

    if (receipt.scilla) {
      const zil_receipt = receipt.scilla;
      const gas_price = uint8ArrayToBigIntBigEndian(zil_receipt.gasPrice);
      const fee = gas_price * zil_receipt.gasLimit;
      const contract_address = zil_receipt.data.length > 0 ? await new Address(zil_receipt.toAddr, AddressType.Bech32).toZilBech32() : null;

      return new HistoricalTransaction({
        contract_address,
        sig: uint8ArrayToHex(zil_receipt.signature, true),
        error: null,
        status_code: null,
        gas_price: gas_price,
        gas_limit: zil_receipt.gasLimit,
        chain_hash: metadata.chainHash,
        chain_type: "Scilla",
        block_number: null,
        transaction_hash: HEX_PREFIX + metadata.hash,
        amount: uint8ArrayToBigIntBigEndian(zil_receipt.amount),
        sender: uint8ArrayToHex(zil_receipt.pubKey),
        recipient: await new Address(zil_receipt.toAddr, AddressType.Bech32).toZilBech32(), // TODO: if token transfer need replace with recipient 
        status: TransactionStatus.Pending,
        timestamp: Math.floor(Date.now() / 1000),
        fee: fee,
        icon: metadata.icon || null,
        title: metadata.title || null,
        nonce: zil_receipt.nonce,
        token_info: metadata.tokenInfo
          ? {
              value: BigInt(metadata.tokenInfo[0]),
              decimals: metadata.tokenInfo[1],
              symbol: metadata.tokenInfo[2],
            }
          : null,
        gas_used: null,
        blob_gas_used: null,
        blob_gas_price: null,
        effective_gas_price: null,
      });
    }
    
    else if (receipt.evm) {
      const evm_tx = receipt.evm;
      const txData = evm_tx.raw;
      const txType = evm_tx.type;
      let effective_gas_price: bigint;

      if (
        txType === "legacy" ||
        txType === "eip2930" ||
        txData.gasPrice !== undefined
      ) {
        effective_gas_price = txData.gasPrice ?? 0n;
      } else if (
        (txType === "eip1559" || txType === "eip4844") &&
        txData.maxFeePerGas !== undefined
      ) {
        const max_fee = txData.maxFeePerGas;
        const priority_fee = txData.maxPriorityFeePerGas ?? 0n;
        effective_gas_price = max_fee < priority_fee ? max_fee : priority_fee;
      } else {
        effective_gas_price = 0n;
      }

      const fee = effective_gas_price * (txData.gasLimit ?? 0n);
      const recipient = txData.to ?? "0x0000000000000000000000000000000000000000";
      
      return new HistoricalTransaction({
        error: null,
        sig: '',
        block_number: null,
        status_code: null,
        contract_address: (txData.to && txData.data && txData.data.length > 2) ? txData.to : null,
        gas_limit: txData.gasLimit ?? null,
        gas_price: txData.gasPrice ?? null,
        chain_hash: metadata.chainHash,
        chain_type: "EVM",
        transaction_hash: metadata.hash,
        amount: txData.value ?? 0n,
        sender: evm_tx.sender,
        recipient,
        fee: fee,
        status: TransactionStatus.Pending,
        timestamp: Math.floor(Date.now() / 1000),
        icon: metadata.icon || null,
        title: metadata.title || null,
        gas_used: null,
        blob_gas_used: null,
        blob_gas_price: null,
        effective_gas_price: effective_gas_price,
        nonce: BigInt(txData.nonce ?? 0),
        token_info: metadata.tokenInfo
          ? {
              value: BigInt(metadata.tokenInfo[0]),
              decimals: metadata.tokenInfo[1],
              symbol: metadata.tokenInfo[2],
            }
          : null,
      });
    }

    throw new Error("Unknown transaction receipt type");
  }
}

