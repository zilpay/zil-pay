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
import { Address } from "crypto/address";
import { hexToUint8Array } from "lib/utils/hex";
import { ETHEREUM } from "config/slip44";
import type { WorkerService } from "./worker";
import { TransactionStatus } from "config/tx";


export class TransactionService {
  #state: BackgroundState;
  #worker: WorkerService;

  constructor(state: BackgroundState, worker: WorkerService) {
    this.#state = state;
    this.#worker = worker;
  }

  async updateTransactionsHistory(walletIndex: number, sendResponse: StreamResponse) {
    try {
      const wallet = this.#state.wallets[walletIndex];
      const account = wallet.accounts[wallet.selectedAccount];
      const chainConfig = this.#state.getChain(account.chainHash)!;
      const provider = new NetworkProvider(chainConfig);
      const pendingTransactions = wallet.history.filter(
        (tx) => (tx.status === TransactionStatus.Pending && tx.metadata.chainHash == account.chainHash)
      );

      await provider.updateTransactionsHistory(pendingTransactions, this.#worker.notifier);
      await this.#state.sync();

      sendResponse({
        resolve: wallet.history,
      });
    } catch (err) {
      sendResponse({
        reject: String(err),
      });
    }
  }

  async signTxAndbroadcastJsonRPC(confirmIndex: number, walletIndex: number, accountIndex: number, sendResponse: StreamResponse) {
    try {
      const wallet = this.#state.wallets[walletIndex];
      const account = wallet.accounts[accountIndex];
      const confirm= wallet .confirm[confirmIndex];

      const chainConfig = this.#state.getChain(account.chainHash)!;
      const defaultChainConfig = this.#state.getChain(wallet.defaultChainHash)!;

      const provider = new NetworkProvider(chainConfig);
      const metadata  = confirm.metadata!; 
      const scilla = confirm.scilla ? ZILTransactionRequest.from(confirm.scilla) : undefined;
      const evm = confirm.evm;
      const txReq = new TransactionRequest(metadata, scilla, evm);
      const keyPair = await wallet.revealKeypair(account.index, defaultChainConfig);
      const signedTx = await txReq.sign(keyPair);

      await signedTx.verify();

      const [history] = await provider.broadcastSignedTransactions([signedTx]);

      this.#state.wallets[walletIndex].history.push(history);
      this.#state.wallets[walletIndex].confirm.splice(confirmIndex, 1);
      await this.#state.sync();

      sendResponse({
        resolve: history,
      });
    } catch (err) {
      sendResponse({ reject: String(err) });
    }
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
        const chainId = token.addrType == AddressType.Bech32 ? chain.chainIds[1] : chain.chainIds[0];
        const to = Address.fromStr(payload.to);

        if (isNative) {
          confirmTx.scilla = {
            chainId,
            toAddr: to.toBase16(),
            amount: amountBigInt.toString(),
            gasLimit: 50,
          };
        } else {
          const tokenAddr = Address.fromStr(token.addr);
          confirmTx.scilla = {
            chainId,
            toAddr: tokenAddr.toBase16(),
            amount: '0',
            gasLimit: 5000,
            data: JSON.stringify({
              _tag: 'Transfer',
              params: [
                { vname: 'to', type: 'ByStr20', value: (await to.toZilChecksum()).toLowerCase() },
                { vname: 'amount', type: 'Uint128', value: amountBigInt.toString() }
              ]
            })
          };
        }
      } else if (token.addrType === AddressType.EthCheckSum) {
        const evmAddr = await Address.fromPubKey(hexToUint8Array(account.pubKey), ETHEREUM);

        if (isNative) {
          confirmTx.evm = {
            from: await evmAddr.toEthChecksum(),
            to: payload.to,
            value: amountBigInt.toString(),
            chainId: chain.chainId,
          };
        } else {
          confirmTx.evm = {
            from: await evmAddr.toEthChecksum(),
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

  async estimateGas(confirmIndex: number, walletIndex: number, accountIndex: number, sendResponse: StreamResponse) {
    try {
      const wallet = this.#state.wallets[walletIndex];
      const account = wallet.accounts[accountIndex];
      const confirm= wallet .confirm[confirmIndex];
      const chainConfig = this.#state.getChain(account.chainHash)!;
      const provider = new NetworkProvider(chainConfig);
      const metadata  = confirm.metadata!; 
      const scilla = confirm.scilla ? ZILTransactionRequest.from(confirm.scilla) : undefined;
      const sender = await Address.fromPubKeyType(hexToUint8Array(account.pubKey), confirm.metadata!.token.addrType);
      const evm = confirm.evm;

      if (evm && confirm.evm?.to) {
        const addr = Address.fromStr(confirm.evm?.to);
        evm.to = await addr.toEthChecksum();
      }

      const txReq = new TransactionRequest(metadata, scilla, evm);
      const gas = await provider.estimateGasParamsBatch(txReq, sender, 4, null);

      sendResponse({
        resolve: {
          gasPrice: gas.gasPrice.toString(),
          maxPriorityFee: gas.maxPriorityFee.toString(),
          feeHistory: {
            maxFee: gas.feeHistory.maxFee.toString(),
            priorityFee: gas.feeHistory.priorityFee.toString(),
            baseFee: gas.feeHistory.baseFee.toString(),
          },
          txEstimateGas: gas.txEstimateGas.toString(),
          blobBaseFee: gas.blobBaseFee.toString(),
          nonce: gas.nonce,
        },
      });
    } catch (err) {
      sendResponse({
        reject: String(err),
      });
    }
  }
}

