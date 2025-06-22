import type { BackgroundState } from "background/storage";
import type { StreamResponse } from "lib/streem";
import { ConfirmState } from "background/storage/confirm";

export class TransactionService {
  #state: BackgroundState;

  constructor(state: BackgroundState) {
    this.#state = state;
  }

  async add(payload: Record<string, unknown>, walletIndex: number, sendResponse: StreamResponse) {
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
