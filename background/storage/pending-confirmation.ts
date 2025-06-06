export enum PendingConfirmationType {
  Transaction,
  SignMessage,
  ConnectDapp,
  SignTypedData
}

export class PendingConfirmation {
  id: string;
  type: PendingConfirmationType;
  origin: string;
  payload: object;
  createdAt: string;
  expiresAt?: string;

  constructor(data: Record<string, unknown>) {
    this.id = (data.id as string) ?? '';
    this.type = data.type as PendingConfirmationType;
    this.origin = data.origin as string;
    this.payload = data.payload as object;
    this.createdAt = (data.createdAt as string) ?? new Date().toISOString();
    this.expiresAt = data.expiresAt as string | undefined;
  }
}

