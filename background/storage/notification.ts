export class Notification {
  transactions: boolean;

  constructor(data: Record<string, unknown>) {
    this.transactions = data.transactions as boolean;
  }
}
