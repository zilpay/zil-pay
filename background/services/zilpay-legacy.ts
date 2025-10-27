import type { BackgroundState } from "background/storage";
import { ConfirmState } from "background/storage/confirm";
import { Address } from "crypto/address";
import { PromptService } from "lib/popup/prompt";
import type { StreamResponse } from "lib/streem";
import type { ConnectParams } from 'types/connect';

export class ZilPayLegacyService {
  #state: BackgroundState;
  #promptService: PromptService = new PromptService();

  constructor(state: BackgroundState) {
    this.#state = state;
  }

  async callConnect(
    payload: ConnectParams,
    sendResponse: (response: any) => void
  ): Promise<void> {
    try {
      const wallet = this.#state.wallets[this.#state.selectedWallet];
      const selectedAccount = wallet.accounts[wallet.selectedAccount];
      const chain = this.#state.getChain(selectedAccount.chainHash);

      // TODO: add check unique
      wallet.confirm.push(new ConfirmState({
        uuid: payload.uuid,
        connect: payload,
      }));

      await this.#state.sync();
      await this.#promptService.open("/connect");

      sendResponse({ reject: "wallet not enabled" });
    } catch (error) {
      sendResponse({ error: String(error) });
    }
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
        resolve: {
          account,
          network: chain.testnet ? "testnet" : "mainnet",
          http: chain.rpc[0],
          nativeHttp: chain.rpc[0],
          isConnect: isConnected,
          isEnable: isConnected,
        }
      });
    } catch (e) {
      sendResponse({ reject: String(e) });
    }
  }
}
