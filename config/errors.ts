export enum ConnectError {
  WalletNotFound = "Wallet is locked",
  WalletNotConnected = 'Wallet not connected',
  UserRejected = "User rejected the request",
  InvalidPayload = "Payload not valid",
  InvalidPermissionRequest = "Invalid permission request",
  UnsupportedMethod = "Unsupported method",
  ChainNotFound = "Chain not found",
}
