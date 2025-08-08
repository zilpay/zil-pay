import { BackgroundState } from "background/storage";
import { TransactionService, WalletService } from "background/services";
import { ProviderService } from "background/services";

export class GlobalState {
  state: BackgroundState;
  readonly wallet: WalletService;
  readonly provider: ProviderService;
  readonly transaction: TransactionService;

  static async fromStorage() {
    const state = await BackgroundState.fromStorage();

    state.selected_wallet = -1; // reset session.

    return new GlobalState(state);
  }

  constructor(initialState: BackgroundState) {
    this.state = initialState;
    this.wallet = new WalletService(this.state);
    this.provider = new ProviderService(this.state);
    this.transaction = new TransactionService(this.state);
  }

  async sync() {
    await this.state.sync();
  }
}
