import type { BackgroundState } from "background/storage";
import type { StreamResponse } from "lib/streem";
import { ConfirmState, type IConfirmState } from "background/storage/confirm";
import type { BuildTokenTransferParams, FTState, TransactionMetadata } from "types/tx";
import { uuid } from "crypto/uuid";
import { processTokenLogo } from "lib/popup/url";
import { AddressType } from "config/wallet";
import { generateErc20TransferData, NetworkProvider } from "background/rpc";
import { TransactionRequest } from "crypto/tx";
import { ZILTransactionRequest } from "crypto/zilliqa_tx";
import { Transaction } from "micro-eth-signer";
import { Address } from "crypto/address";
import { hexToUint8Array } from "lib/utils/hex";


export class TransactionService {
  #state: BackgroundState;

  constructor(state: BackgroundState) {
    this.#state = state;
  }

  async buildTokenTransfer(payload: BuildTokenTransferParams, sendResponse: StreamResponse) {
    try {
      const wallet = this.#state.wallets[payload.walletIndex];
      const account = wallet.accounts[payload.accountIndex];
      const token = wallet.tokens.find(t => t.addr.toLowerCase() === payload.tokenAddr.toLowerCase());
      const chain = this.#state.getChain(account.chainHash);

      if (!token || !chain) {
        throw new Error("Token or chain not found");
      }

      const amountBigInt = BigInt(payload.amount);
      const isNative = token.native;
      const tokenMetadata: FTState = {
        ...token,
        balances: undefined,
        value: payload.amount,
        recipient: payload.to,
      };
      const metadata: TransactionMetadata = {
        chainHash: account.chainHash,
        token: tokenMetadata,
        title: `Send ${token.symbol}`, // TODO: change title.
        icon: processTokenLogo({ token, theme: this.#state.appearances }),
      }

      const confirmTx: IConfirmState = {
        uuid: uuid(),
        metadata,
      };

      if (token.addrType === AddressType.Bech32) {
        if (isNative) {
          confirmTx.scilla = {
            chainId: chain.chainId,
            toAddr: payload.to,
            amount: amountBigInt.toString(),
          };
        } else {
          confirmTx.scilla = {
            chainId: chain.chainId,
            toAddr: token.addr,
            amount: '0',
            data: JSON.stringify({
              _tag: 'Transfer',
              params: [
                { vname: 'to', type: 'ByStr20', value: payload.to.replace('zil1', '0x') },
                { vname: 'amount', type: 'Uint128', value: amountBigInt.toString() }
              ]
            })
          };
        }
      } else if (token.addrType === AddressType.EthCheckSum) {
        if (isNative) {
          confirmTx.evm = {
            from: account.addr,
            to: payload.to,
            value: amountBigInt.toString(),
            chainId: chain.chainId,
          };
        } else {
          confirmTx.evm = {
            from: account.addr,
            to: token.addr,
            value: '0',
            data: generateErc20TransferData(payload.to, amountBigInt),
            chainId: chain.chainId,
          };
        }
      }

      wallet.confirm.push(new ConfirmState(confirmTx));
      await this.#state.sync();

      sendResponse({ resolve: this.#state });
    } catch (err) {
      sendResponse({ reject: String(err) });
    }
  }

  async add(payload: IConfirmState, walletIndex: number, sendResponse: StreamResponse) {
    try {
      const wallet = this.#state.wallets[walletIndex];
      const scillaTx = new ConfirmState(payload);

      wallet.confirm.push(scillaTx);
      await this.#state.sync();

      sendResponse({
        resolve: true,
      });
    } catch (err) {
      sendResponse({
        reject: String(err),
      });
    }
  }

  async reject(index: number, walletIndex: number, sendResponse: StreamResponse) {
    try {
      const wallet = this.#state.wallets[walletIndex];

      wallet.confirm.splice(index, 1);
      await this.#state.sync();
      // TODO: sending response to Tab with uuid.

      sendResponse({
        resolve: true,
      });
    } catch (err) {
      sendResponse({
        reject: String(err),
      });
    }
  }

  async estimateGas(payload: IConfirmState, walletIndex: number, accountIndex: number, sendResponse: StreamResponse) {
    try {
      const wallet = this.#state.wallets[walletIndex];
      const account = wallet.accounts[accountIndex];
      const chainConfig = this.#state.getChain(account.chainHash)!;
      const provider = new NetworkProvider(chainConfig);
      const metadata  = payload.metadata!; 
      const scilla = payload.scilla ? ZILTransactionRequest.from(payload.scilla) : undefined;
      const sender = await Address.fromPubKey(hexToUint8Array(account.pubKey), account.slip44);
      const evm = payload.evm ? Transaction.prepare({
        value: BigInt(payload.evm.value ?? 0),
        to: await Address.fromStr(payload.evm.to!).toEthChecksum(),
        data: payload.evm.data,
        nonce: 0n,
        maxFeePerGas: 0n,
      }) : undefined;
      const txReq = new TransactionRequest(metadata, scilla, evm);
      const gas = await provider.estimateGasParamsBatch(txReq, sender, 4, null);

      console.log(gas);

      sendResponse({
        resolve: true,
      });
    } catch (err) {
      sendResponse({
        reject: String(err),
      });
    }
  }
}
