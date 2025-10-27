import type { BackgroundState } from "background/storage";
import { ConfirmState } from "background/storage/confirm";
import { MTypePopup } from "config/stream";
import { PromptService } from "lib/popup/prompt";
import type { StreamResponse } from "lib/streem";
import { TabsMessage } from "lib/streem/tabs-message";
import type { ConnectParams } from "types/connect";

export class ConnectService {
  #state: BackgroundState;

  constructor(state: BackgroundState) {
    this.#state = state;
  }

  async callConnect(
    payload: ConnectParams,
    sendResponse: StreamResponse,
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
      new PromptService().open("/connect");

      sendResponse({ reject: "wallet not enabled" });
    } catch (error) {
      sendResponse({ reject: String(error) });
    }
  }

  async rejectConnect(
    uuid: string,
    walletIndex: number,
    sendResponse: StreamResponse,
  ): Promise<void> {
    try {
      const wallet = this.#state.wallets[walletIndex];
      const confirmRequest = wallet.confirm.find(c => c.uuid === uuid);

      wallet.confirm = wallet.confirm.filter(c => c.uuid !== uuid);

      await this.#state.sync();

      if (confirmRequest && confirmRequest.connect) {
        new TabsMessage({
          type: MTypePopup.RESPONSE_TO_DAPP,
          payload: {
            uuid,
            account: null,
          },
        }).send(confirmRequest.connect.domain);
      }

      sendResponse({ resolve: wallet.confirm, });
    } catch (error) {
      sendResponse({ reject: String(error) });
    }
  }

}
