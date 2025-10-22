import type { BackgroundState } from "background/storage";
import type { StreamResponse } from "lib/streem";

export class ZilPayLegacyService {
  #state: BackgroundState;

  constructor(state: BackgroundState) {
    this.#state = state;
  }

  async getData(sendResponse: StreamResponse) {
    try {
      const wallet = this.#state.wallets[this.#state.selectedWallet];
      const selectedAccount = wallet.accounts[wallet.selectedAccount];
      let account = null;

      // if (has) {
      //   account = {
      //     base16: this.#core.account.selectedAccount.base16,
      //     bech32: this.#core.account.selectedAccount.bech32
      //   }
      // }
      
      sendResponse({
        resolve: {
          account,
          // netwrok: this.#core.netwrok.selected,
          // http: this.#core.netwrok.provider,
          // nativeHttp: this.#core.netwrok.nativeHttp,
          // isConnect: has,
          // isEnable: this.#core.guard.isEnable,
          // phishing: this.#core.apps.phishing
        }
      });
    } catch (e) {
      sendResponse({ reject: String(e) });
    }
  }
}
