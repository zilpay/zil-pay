/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */

// This string need that sould did't have problem with conflicts.
const app = 'zil-pay';

export const MTypeTabContent = {
  CONTENT: `@/${app}/content-script`,
  INJECTED: `@/${app}/injected-script`
};

export const MTypePopup = {
  GET_RANDOM_SEED: `@/${app}/generate-random-seed`,
  CREATE_ACCOUNT_BY_SEED: `@/${app}/set-account-by-seed-words`,

  SET_PASSWORD: `@/${app}/popup-set-password`,
  LOG_OUT: `@/${app}/popup-logout`,
  SET_SEED_AND_PASSWORD: `@/${app}/popup-set-seed-words-and-password`,

  GET_WALLET_STATE: `@/${app}/get-wallet-state`,

  EXPORT_SEED: `@/${app}/popup-export-seed-words`,
  EXPORT_PRIVATE_KEY: `@/${app}/popup-export-private-key`,
  EXPORT_QR_CODE: `@/${app}/export-qr-code-by-index`,

  IMPORT_PRIVATE_KEY: `@/${app}/popup-import-private-key`,
  IMPORT_KEYSTORE: `@/${app}/popup-import-keystore`,
  RM_ACCOUNT: `@/${app}/remove-selected-account`,

  UPDATE_BALANCE: `@/${app}/popup-account-balance-upadte`,

  SIGN_AND_SEND: `@/${app}/popup-send-to-sign-tx`,
  DOMAIN_RESOLVE: `@/${app}/popup-resolve-domain`,
  REJECT_CONFIRM_TX: `@/${app}/popup-reject-confirm-tx`,
  REJECT_ALL_CONFIRM_TXNS: `@/${app}/popup-reject-al-confirm-txns`,
  CONFIRM_SIGN_MSG: `@/${app}/popup-confirm-sign-msg`,

  GET_ZRC2_TOKEN_INFO: `@/${app}/get-zrc2-token-info`,
  ADD_ZRC2_TOKEN: `@/${app}/add-new-zrc2-token`,
  RM_TOKEN: `@/${app}/remove-token`,

  SELECT_SSN: `@/${app}/select-from-ssn-list`,
  RESET_NETWROK: `@/${app}/reset-netwrok-settings`,
  SET_NET_CONFIG: `@/${app}/set-netwrok-config`,
  SELECT_NETWORK: `@/${app}/select-network`,
  SELECT_ACCOUNT: `@/${app}/select-account`,

  UPDATE_SSN_LIST: `@/${app}/update-ssn-list`,
  GET_ACCOUNT_NONCE: `@/${app}/get-account-nonce`,
  ENCRYPT_WALLET: `@/${app}/encrypt-wallet-aes`,

  USER_RESPONSE_DAPP: `@/${app}/user-response-connect-dapp`,
  RM_APP: `@/${app}/remove-dapp`,
  CLEAR_APPS: `@/${app}/clear-all-apps`,

  ADD_CONTACT: `@/${app}/add-a-contact`,
  RM_CONTACT: `@/${app}/remove-a-contact`,

  LEDGER_LOAD_ACCOUNT: `@/${app}/ledger-load-account`,

  CHANGE_CURRENCY: `@/${app}/change-currency`,
  RESET_CURRENCY: `@/${app}/reset-currency`,

  SET_THEME: `@/${app}/set-theme-mode`
};

export const MTypeTab = {
  GET_WALLET_DATA: `@/${app}/injected-get-wallet-data`,
  ADDRESS_CHANGED: `@/${app}/address-changed`,
  NETWORK_CHANGED: `@/${app}/network-changed`,
  LOCK_STAUS: `@/${app}/lack-status-updated`,

  CONTENT_PROXY_MEHTOD: `@/${app}/request-through-content`,
  CONTENT_PROXY_RESULT: `@/${app}/response-from-content`,

  CALL_TO_SIGN_TX: `@/${app}/request-to-sign-tx`,
  SIGN_MESSAGE: `@/${app}/request-to-sign-message`,
  TX_RESULT: `@/${app}/response-tx-result`,
  SING_MESSAGE_RES: `@/${app}/response-sign-message`,
  NEW_BLOCK: `@/${app}/new-block-created`,

  CONNECT_APP: `@/${app}/request-to-connect-dapp`,
  RESPONSE_TO_DAPP: `@/${app}/response-dapp-connect`
};
