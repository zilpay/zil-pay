import type { BackgroundState } from "background/storage";
import type { StreamResponse } from "lib/streem";
import { ConfirmState, type IConfirmState } from "background/storage/confirm";
import type { BuildTokenTransferParams, TokenTransferMetadata } from "types/tx";
import { uuid } from "crypto/uuid";
import { processTokenLogo } from "lib/popup/url";
import { AddressType } from "config/wallet";
import { generateErc20TransferData } from "background/rpc";

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

      const tokenMetadata: TokenTransferMetadata = {
        decimals: token.decimals,
        symbol: token.symbol,
        name: token.name,
        to: payload.to,
        amount: payload.amount,
      };

      const confirmTx: IConfirmState = {
        uuid: uuid(),
        title: `Send ${token.symbol}`,
        icon: processTokenLogo({ token, theme: this.#state.appearances }),
        token: tokenMetadata
      };

      if (token.addrType === AddressType.Bech32) {
        if (isNative) {
          confirmTx.scilla = {
            chainId: chain.chainId,
            toAddr: payload.to,
            amount: amountBigInt.toString(),
            gasPrice: '2000000000',
            gasLimit: '50'
          };
        } else {
          confirmTx.scilla = {
            chainId: chain.chainId,
            toAddr: token.addr,
            amount: '0',
            gasPrice: '2000000000',
            gasLimit: '5000',
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
            gasLimit: 21000
          };
        } else {
          confirmTx.evm = {
            from: account.addr,
            to: token.addr,
            value: '0',
            data: generateErc20TransferData(payload.to, amountBigInt),
            chainId: chain.chainId,
            gasLimit: 65000
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
}
