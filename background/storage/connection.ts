export class ConnectedDApp {
  origin: string;
  name?: string;
  iconUrl?: string;
  connectedDate: string;
  connectedWalletIds: string[];
  permissionsGranted?: string[];

  constructor(data: Record<string, unknown>) {
    this.origin = data.origin as string;
    this.name = data.name as string | undefined;
    this.iconUrl = data.iconUrl as string | undefined;
    this.connectedDate = (data.connectedDate as string) ?? new Date().toISOString();
    this.connectedWalletIds = (data.connectedWalletIds as string[]) ?? [];
    this.permissionsGranted = data.permissionsGranted as string[] | undefined;
  }
}

