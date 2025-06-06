export class AppState {
  currentBlockNumber: string;
  lastFullSyncTimestamp?: string;
  lastPriceUpdateTimestamp?: string;
  isFirstLaunch?: boolean;

  constructor(data: Record<string, unknown>) {
    this.currentBlockNumber = (data.currentBlockNumber as string) ?? "0";
    this.lastFullSyncTimestamp = data.lastFullSyncTimestamp as string | undefined;
    this.lastPriceUpdateTimestamp = data.lastPriceUpdateTimestamp as string | undefined;
    this.isFirstLaunch = (data.isFirstLaunch as boolean) ?? false;
  }

  toJSON(): Record<string, unknown> {
    return {
      currentBlockNumber: this.currentBlockNumber,
      lastFullSyncTimestamp: this.lastFullSyncTimestamp,
      lastPriceUpdateTimestamp: this.lastPriceUpdateTimestamp,
      isFirstLaunch: this.isFirstLaunch,
    };
  }
}
