
export class Vault {
  autoLockMinutes: number;
  phishingDetectionEnabled: boolean;
  bip39VaultSeed: Uint8Array;

  constructor(data: Record<string, unknown>) {
    this.autoLockMinutes = (data.autoLockMinutes as number) ?? 1;
    this.phishingDetectionEnabled = (data.phishingDetectionEnabled as boolean) ?? true;
  }
}
