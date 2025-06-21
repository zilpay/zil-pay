export interface SetPasswordPayload {
  walletIndex: number;
  cipherOrders: CipherOrders[];
  memory: number;
  iterations: number;
  threads: number;
  secret: string;
  hashType: HashTypes;
  hashSize: ShaAlgorithms;
  currentPassword: string;
  newPassword: string;
}
