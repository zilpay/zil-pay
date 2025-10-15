import type { BackgroundState } from "background/storage";
import { NetworkProvider } from "background/rpc";
import { TransactionStatus } from "config/tx";
import { Runtime } from "lib/runtime";

const WORKER_ALARM_NAME = "transaction-worker";

export class WorkerService {
  #state: BackgroundState;
  #isRunning: boolean = false;

  constructor(state: BackgroundState) {
    this.#state = state;
    this.#setupAlarmListener();
  }

  #setupAlarmListener(): void {
    Runtime.alarms.onAlarm.addListener(async (alarm) => {
      if (alarm.name === WORKER_ALARM_NAME && this.#isRunning) {
        await this.#processTransactions();
      }
    });
  }

  async start(): Promise<void> {
    if (this.#isRunning) {
      return;
    }

    const walletIndex = this.#state.selectedWallet;

    if (walletIndex === -1) {
      return;
    }

    const wallet = this.#state.wallets[walletIndex];

    if (!wallet) {
      return;
    }

    const account = wallet.accounts[wallet.selectedAccount];

    if (!account) {
      return;
    }

    const chainConfig = this.#state.getChain(account.chainHash);

    if (!chainConfig) {
      return;
    }

    const intervalMinutes = Math.max(chainConfig.diffBlockTime / 60, 1);

    await Runtime.alarms.create(WORKER_ALARM_NAME, {
      periodInMinutes: intervalMinutes,
    });

    this.#isRunning = true;
  }

  async stop(): Promise<void> {
    await Runtime.alarms.clear(WORKER_ALARM_NAME);
    this.#isRunning = false;
  }

  async #processTransactions(): Promise<void> {
    const walletIndex = this.#state.selectedWallet;

    if (walletIndex === -1) {
      await this.stop();
      return;
    }

    const wallet = this.#state.wallets[walletIndex];

    if (!wallet) {
      await this.stop();
      return;
    }

    const account = wallet.accounts[wallet.selectedAccount];

    if (!account) {
      return;
    }

    const pendingTransactions = wallet.history.filter(
      (tx) => (tx.status === TransactionStatus.Pending && tx.metadata.chainHash == account.chainHash)
    );

    if (pendingTransactions.length === 0) {
      return;
    }

    const chainConfig = this.#state.getChain(account.chainHash);

    if (!chainConfig) {
      return;
    }

    try {
      const provider = new NetworkProvider(chainConfig);
      await provider.updateTransactionsHistory(pendingTransactions);
      await this.#state.sync();
    } catch (error) {
      console.error('Transaction update failed:', error);
    }
  }
}
