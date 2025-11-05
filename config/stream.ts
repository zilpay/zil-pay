const app = "BearBy";

export const MTypePopup = {
  GET_GLOBAL_STATE: `@/${app}/get-global-state`,
  SET_GLOBAL_STATE: `@/${app}/set-global-state`,

  GEN_BIP39: `@/${app}/gen-bip39-words`,
  VALIDATE_BIP39_CHECK_SUM: `@/${app}/validate-bip39-checksum`,
  GEN_KEYPAIR: `@/${app}/gen-key-pair`,
  FROM_PRIV_KEY: `@/${app}/keypair-from-private-key`,
  FROM_LEDGER_HW: `@/${app}/wallet-from-ledger-hw`,
  DESTROY_WALLET: `@/${app}/destroy-wallet`,
  DESTROY_ACCOUNT: `@/${app}/destroy-account`,
  ADD_NEXT_BIP39_ACCOUNT: `@/${app}/add-next-bip39-account`,

  WALLET_FROM_PRIVATE_KEY: `@/${app}/create-wallet-from-private-key`,
  WALLET_FROM_WATCHED_ACCOUNT: `@/${app}/create-wallet-from-account-watached`,
  WALLET_FROM_BIP39: `@/${app}/create-wallet-from-bip39`,

  UNLOCK_WALLET: `@/${app}/unlock-wallet`,
  LOG_OUT: `@/${app}/logout`,
  REVEAL_BIP39: `@/${app}/reveal-bip39`,
  REVEAL_KEY: `@/${app}/reveal-key`,
  SELECT_ACCOUNT: `@/${app}/select-account`,

  WALLET_BALANCE_UPDATE: `@/${app}/wallet-balance-update`,
  FT_GET_META: `@/${app}/get-ft-meta`,
  NFT_GET_META: `@/${app}/get-nft-meta`,

  FT_UPDATE_RATES: `@/${app}/ft-rates-update`,

  SWICH_CHAIN: `@/${app}/swich-chain`,
  REMOVE_CHAIN: `@/${app}/remove-chain`,

  BUILD_TOKEN_TRANSFER: `@/${app}/build-token-transfer`,
  REJECT_CONFIRM: `@/${app}/reject-confirm`,
  ESTIMATE_GAS: `@/${app}/estimate-gas`,
  SIGN_TX_AND_SEND: `@/${app}/sign-tx-and-send-jsonRPC`,
  CHECK_TRANSACTIONS_HISTORY: `@/${app}/check-transactions-history`,
  GET_ALL_ACCOUNTS_BY_CHAIN: `@/${app}/get-all-accounts-by-chain`,
  GEN_RLP_TX: `@/${app}/gen-rlp-tx`,

  CONNECT_APP: `@/${app}/request-to-connect-dapp`,
  RESPONSE_TO_DAPP: `@/${app}/response-dapp-connect`,
  DISCONNECT_WALLET: `@/${app}/wallet-disconnect`,

  WEB3_GET_SLIP44: `@/${app}/web3-get-slip44`,

  EVM_REQUEST: `BEARBY_REQUEST`,
  EVM_RESPONSE: `BEARBY_RESPONSE`,
  EVM_EVENT: `BEARBY_EVENT`,
  EVM_RESPONSE_PERSONAL_MESSAGE: `@/${app}/evm-response-personal-message`,
  EVM_RESPONSE_TYPED_MESSAGE: `@/${app}/evm-response-typed-message`,
  EVM_RESPONSE_ADD_ETHEREUM_CHAIN: `@/${app}/evm-response-add-ethereum-chain`,
  EVM_RESPONSE_WATCH_ASSET: `@/${app}/evm-response-watch-asset`,
};
