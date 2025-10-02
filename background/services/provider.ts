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
      const tokens = wallet.tokens.filter((t) => t.chainHash === account.chainHash);
      const chainConfig = this.#state.getChain(account.chainHash)!;
      const provider = new NetworkProvider(chainConfig);
      const addresses = wallet.accounts.map((a) => Address.fromStr(a.addr));

      await provider.updateBalances(tokens, addresses);
      this.#state.sync();

      sendResponse({
        resolve: tokens,
      });
    } catch (err) {
      sendResponse({
        reject: String(err),
      });
    }
  }

  async sendSignedTransaction(sendResponse: StreamResponse) {}

  async getCurrentBlock(walletIndex: number, accountIndex: number, sendResponse: StreamResponse) {
    try {
      const wallet = this.#state.wallets[walletIndex];
      const account = wallet.accounts[accountIndex];
      const chainConfig = this.#state.getChain(account.chainHash)!;
      const provider = new NetworkProvider(chainConfig);
      const blockNumber = await provider.getCurrentBlockNumber();

      sendResponse({
        resolve: blockNumber.toString(),
      });
    } catch (err) {
      sendResponse({
        reject: String(err),
      });
    }
  }

  async proxyChannel(sendResponse: StreamResponse) {}

  async estimateBlockTime(walletIndex: number, accountIndex: number, sendResponse: StreamResponse) {
    try {
      const wallet = this.#state.wallets[walletIndex];
      const account = wallet.accounts[accountIndex];
      const chainConfig = this.#state.getChain(account.chainHash)!;
      const provider = new NetworkProvider(chainConfig);
      const blockTime = await provider.estimateBlockTime();

      sendResponse({
        resolve: blockTime,
      });
    } catch (err) {
      sendResponse({
        reject: String(err),
      });
    }
  }

  async estimateGasParamsBatch(sendResponse: StreamResponse) {}

  async fetchFtokenMeta(contract: string, walletIndex: number, accountIndex: number, sendResponse: StreamResponse) {
    try {
      const contractAddr = Address.fromStr(contract);
      const wallet = this.#state.wallets[walletIndex];
      const account = wallet.accounts[accountIndex];
      const chainConfig = this.#state.getChain(account.chainHash)!;
      const provider = new NetworkProvider(chainConfig);
      const addresses = wallet.accounts.map((a) => Address.fromStr(a.addr));
      const metadata = await provider.ftokenMeta(contractAddr, addresses);

      sendResponse({
        resolve: metadata,
      });
    } catch (err) {
      sendResponse({
        reject: String(err),
      });
    }
  }
}

