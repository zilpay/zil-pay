export class Notification {
  transactions: boolean;

  constructor(data: {
    transactions: boolean;
  }) {
    this.transactions = data.transactions;
  }
}
