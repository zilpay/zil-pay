import { NetworkProvider } from "background/rpc";
import type { BackgroundState } from "background/storage";
import { Address } from "crypto/address";
import type { StreamResponse } from "lib/streem";

export class ProviderService {
  #state: BackgroundState;

  constructor(state: BackgroundState) {
    this.#state = state;
  }

  async balanceUpdate(walletIndex: number, sendResponse: StreamResponse) {
    try {
      const wallet = this.#state.wallets[walletIndex];
      const account = wallet.accounts[wallet.selectedAccount];
      const chainConfig = this.#state.getChain(account.chainHash)!;
      const provider = new NetworkProvider(chainConfig);
      const addresses = wallet.accounts.map((a) => Address.fromStr(a.addr));

      await provider.updateBalances(wallet.tokens, addresses);
      this.#state.sync();

      sendResponse({
        resolve: true,
      });
    } catch (err) {
      sendResponse({
        reject: String(err),
      });
    }
  }

  async sendSignedTransaction(sendResponse: StreamResponse) {}

  async getCurrentBlock(sendResponse: StreamResponse) {}

  async proxyChannel(sendResponse: StreamResponse) {}

  async estimateBlockTime(sendResponse: StreamResponse) {}

  async estimateGasParamsBatch(sendResponse: StreamResponse) {}

  async fetchFtokenMeta(sendResponse: StreamResponse) {}

  async updateTransactionsHistory(sendResponse: StreamResponse) {}
}

