import { BackgroundState } from "background/storage";
import { TransactionService, WalletService } from "background/services";
import { ProviderService } from "background/services";
import { Session } from "./secure";
import { WorkerService } from "./services/worker";
import { TokenService } from "./services/token";
import { ZilPayLegacyService } from "./services/zilpay-legacy";

export class GlobalState {
  state: BackgroundState;
  readonly wallet: WalletService;
  readonly zilpayLegacyWeb3: ZilPayLegacyService;
  readonly provider: ProviderService;
  readonly transaction: TransactionService;
  readonly worker: WorkerService;
  readonly token: TokenService;

  static async fromStorage() {
    const state = await BackgroundState.fromStorage();
    state.selectedWallet = await Session.getActiveWallet();
    return new GlobalState(state);
  }

  constructor(initialState: BackgroundState) {
    this.state = initialState;
    this.worker = new WorkerService(this.state);
    this.wallet = new WalletService(this.state, this.worker);
    this.provider = new ProviderService(this.state, this.worker);
    this.transaction = new TransactionService(this.state, this.worker);
    this.token = new TokenService(this.state);
    this.zilpayLegacyWeb3 = new ZilPayLegacyService(this.state);
  }

  async sync() {
    await this.state.sync();
  }
}
