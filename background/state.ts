import { BackgroundState } from "background/storage";
import { WalletService } from 'background/services';
import { ProviderService } from 'background/services';

export class GlobalState {
  state: BackgroundState;
  readonly wallet: WalletService;
  readonly provider: ProviderService;

  static async fromStorage() {
    const state = await BackgroundState.fromStorage();

    return new GlobalState(state);
  }

  constructor(initialState: BackgroundState) {
    this.state = initialState;
    this.wallet = new WalletService(this.state);
    this.provider = new ProviderService(this.state);
  }

  async sync() {
    await this.state.sync();
  }
}
