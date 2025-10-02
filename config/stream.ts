const app = "BearBy";

export const MTypePopup = {
  GET_GLOBAL_STATE: `@/${app}/get-global-state`,
  SET_GLOBAL_STATE: `@/${app}/set-global-state`,

  GEN_BIP39: `@/${app}/gen-bip39-words`,
  VALIDATE_BIP39_CHECK_SUM: `@/${app}/validate-bip39-checksum`,
  GEN_KEYPAIR: `@/${app}/gen-key-pair`,
  FROM_PRIV_KEY: `@/${app}/keypair-from-private-key`,

  WALLET_FROM_PRIVATE_KEY: `@/${app}/create-wallet-from-private-key`,
  WALLET_FROM_BIP39: `@/${app}/create-wallet-from-bip39`,

  UNLOCK_WALLET: `@/${app}/unlock-wallet`,
  LOG_OUT: `@/${app}/logout`,

  WALLET_BALANCE_UPDATE: `@/${app}/wallet-balance-update`,
  FT_GET_META: `@/${app}/get-ft-meta`,
}

