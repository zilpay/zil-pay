import { TransactionReceipt } from 'crypto/tx';
import { uint8ArrayToBigIntBigEndian } from 'crypto/number';
import { HEX_PREFIX, uint8ArrayToHex } from 'lib/utils/hex';
import { Address, AddressType } from 'crypto/address';
import { uint8ArrayToUtf8 } from 'lib/utils/utf8';
import { ETHEREUM } from 'config/slip44';
import { initSig } from "micro-eth-signer/utils.js";


export enum TransactionStatus {
  Pending,
  Success,
  Failed,
}

export type ChainType = "EVM" | "Scilla";

export interface IHistoricalTransactionState {
  transaction_hash: string;
  amount: bigint;
  sender: string;
  recipient: string;
  contract_address: string | null;
  status: TransactionStatus;
  status_code: number | null;
  timestamp: number;
  block_number: bigint | null;
  gasUsed: bigint | null;
  gasLimit: bigint | null;
  gasPrice: bigint | null;
  blobGasUsed: bigint | null;
  blobGasPrice: bigint | null;
  effectiveGasPrice: bigint | null;
  fee: bigint;
  icon: string | null;
  title: string | null;
  error: string | null;
  sig: string;
  nonce: bigint;
  token_info: TokenInfo | null;
  chain_type: ChainType;
  chain_hash: number;
  data?: string;
  code?: string;
}

export interface TokenInfo {
  value: bigint;
  symbol: string;
  decimals: number;
}

export class HistoricalTransaction implements IHistoricalTransactionState {
  public transaction_hash: string;
  public amount: bigint;
  public sender: string;
  public recipient: string;
  public contract_address: string | null;
  public status: TransactionStatus;
  public status_code: number | null;
  public timestamp: number;
  public block_number: bigint | null;
  public gasUsed: bigint | null;
  public gasLimit: bigint | null;
  public gasPrice: bigint | null;
  public blobGasUsed: bigint | null;
  public blobGasPrice: bigint | null;
  public effectiveGasPrice: bigint | null;
  public fee: bigint;
  public icon: string | null;
  public title: string | null;
  public error: string | null;
  public sig: string;
  public nonce: bigint;
  public token_info: TokenInfo | null;
  public chain_type: ChainType;
  public chain_hash: number;
  public data?: string;
  public code?: string;

  constructor(data: IHistoricalTransactionState) {
    this.transaction_hash = data.transaction_hash;
    this.amount = data.amount;
    this.sender = data.sender;
    this.recipient = data.recipient;
    this.contract_address = data.contract_address;
    this.status = data.status;
    this.status_code = data.status_code;
    this.timestamp = data.timestamp;
    this.block_number = data.block_number;
    this.gasUsed = data.gasUsed;
    this.gasLimit = data.gasLimit;
    this.gasPrice = data.gasPrice;
    this.blobGasUsed = data.blobGasUsed;
    this.blobGasPrice = data.blobGasPrice;
    this.effectiveGasPrice = data.effectiveGasPrice;
    this.fee = data.fee;
    this.icon = data.icon;
    this.title = data.title;
    this.error = data.error;
    this.sig = data.sig;
    this.nonce = data.nonce;
    this.token_info = data.token_info;
    this.chain_type = data.chain_type;
    this.chain_hash = data.chain_hash;
    this.data= data.data;
    this.code = data.code;
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
      const data = zil_receipt.data.length > 0 ? uint8ArrayToUtf8(zil_receipt.data) : '';
      const code = zil_receipt.code.length > 0 ? uint8ArrayToUtf8(zil_receipt.code) : '';

      return new HistoricalTransaction({
        data,
        code,
        contract_address,
        sig: uint8ArrayToHex(zil_receipt.signature, true),
        error: null,
        status_code: null,
        gasPrice: gas_price,
        gasLimit: zil_receipt.gasLimit,
        chain_hash: metadata.chainHash,
        chain_type: "Scilla",
        block_number: null,
        transaction_hash: metadata.hash,
        amount: uint8ArrayToBigIntBigEndian(zil_receipt.amount),
        sender: uint8ArrayToHex(zil_receipt.pubKey),
        recipient: await new Address(zil_receipt.toAddr, AddressType.Bech32).toZilBech32(), // TODO: if token transfer need replace with recipient 
        status: TransactionStatus.Pending,
        timestamp: new Date().getTime(),
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
        gasUsed: null,
        blobGasUsed: null,
        blobGasPrice: null,
        effectiveGasPrice: null,
      });
    }
    else if (receipt.evm) {
      const evm_tx = receipt.evm; 
      const txData = evm_tx.raw as any; // TODO: this is bad
      const data = txData.data;
      const txType = evm_tx.type;
      const sig = initSig({ r: txData.r!, s: txData.s!, }, txData.yParity!);
      let effectiveGasPrice: bigint;
      let gasPrice = null;

      if (
        txType === "legacy" ||
        txType === "eip2930" ||
        txData.gasPrice
      ) {
        effectiveGasPrice = txData.gasPrice ?? 0n;
      } else if (
        (txType === "eip1559" || txType === "eip4844") &&
        txData.maxFeePerGas !== undefined
      ) {
        const max_fee = txData.maxFeePerGas ?? 0n;
        const priority_fee = txData.maxPriorityFeePerGas ?? 0n;
        effectiveGasPrice = max_fee < priority_fee ? max_fee : priority_fee;
      } else {
        effectiveGasPrice = 0n;
      }

      const recipient = txData.to ?? await Address.empty(ETHEREUM).toEthChecksum();
      
      return new HistoricalTransaction({
        gasPrice,
        data,
        error: null,
        sig: HEX_PREFIX + sig.toCompactHex(), // TODO: fix it.
        block_number: null,
        status_code: null,
        contract_address: (txData.to && txData.data && txData.data.length > 2) ? txData.to : null,
        gasLimit: txData.gasLimit ?? null,
        chain_hash: metadata.chainHash,
        chain_type: "EVM",
        transaction_hash: metadata.hash,
        amount: txData.value ?? 0n,
        sender: evm_tx.sender,
        recipient,
        fee: receipt.evm.fee,
        status: TransactionStatus.Pending,
        timestamp: new Date().getTime(),
        icon: metadata.icon || null,
        title: metadata.title || null,
        gasUsed: null,
        blobGasUsed: null,
        blobGasPrice: null,
        effectiveGasPrice: effectiveGasPrice,
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

  toJSON(): Record<string, unknown> {
    return {
      transaction_hash: this.transaction_hash,
      amount: this.amount.toString(),
      sender: this.sender,
      recipient: this.recipient,
      contract_address: this.contract_address,
      status: this.status,
      status_code: this.status_code,
      timestamp: this.timestamp,
      block_number: this.block_number?.toString() ?? null,
      gasUsed: this.gasUsed?.toString() ?? null,
      gasLimit: this.gasLimit?.toString() ?? null,
      gasPrice: this.gasPrice?.toString() ?? null,
      blobGasUsed: this.blobGasUsed?.toString() ?? null,
      blobGasPrice: this.blobGasPrice?.toString() ?? null,
      effectiveGasPrice: this.effectiveGasPrice?.toString() ?? null,
      fee: this.fee.toString(),
      icon: this.icon,
      title: this.title,
      error: this.error,
      sig: this.sig,
      nonce: this.nonce.toString(),
      token_info: this.token_info ? {
        value: this.token_info.value.toString(),
        symbol: this.token_info.symbol,
        decimals: this.token_info.decimals
      } : null,
      chain_type: this.chain_type,
      chain_hash: this.chain_hash,
      data: this.data,
      code: this.code
    };
  }
}

