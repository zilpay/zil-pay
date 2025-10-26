import type { BackgroundState } from "background/storage";
import { Address } from "crypto/address";
import type { StreamResponse } from "lib/streem";

export class ZilPayLegacyService {
  #state: BackgroundState;

  constructor(state: BackgroundState) {
    this.#state = state;
  }

  async getData(domain: string, sendResponse: StreamResponse) {
    try {
      const emptyResponse = {
        account: null,
        network: null,
        http: null,
        nativeHttp: null,
        isConnect: false,
        isEnable: false,
      };

      const wallet = this.#state.wallets[this.#state.selectedWallet];
      if (!wallet) {
        sendResponse({ resolve: emptyResponse });
        return;
      }

      const selectedAccount = wallet.accounts[wallet.selectedAccount];
      if (!selectedAccount) {
        sendResponse({ resolve: emptyResponse });
        return;
      }

      const chain = this.#state.getChain(selectedAccount.chainHash);
      if (!chain || !chain.rpc[0]) {
        sendResponse({ resolve: emptyResponse });
        return;
      }

      const isConnected = this.#state.connections.isConnected(domain);
      let account = null;

      if (isConnected) {
        const addr = Address.fromStr(selectedAccount.addr.split(":")[0]);
        account = {
          base16: await addr.toZilChecksum(),
          bech32: await addr.toZilBech32(),
        };
      }

      sendResponse({
        account,
        network: chain.testnet ? "testnet" : "mainnet",
        http: chain.rpc[0],
        nativeHttp: chain.rpc[0],
        isConnect: isConnected,
        isEnable: isConnected,
      } as any);
    } catch (e) {
      sendResponse({ reject: String(e) });
    }
  }
}
