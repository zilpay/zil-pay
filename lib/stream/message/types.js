/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */

// This string need that sould did't have problem with conflicts.
const app = 'zil-pay'

export const MTypeTabContent = {
  CONTENT: `@/${app}/content-script`,
  INJECTED: `@/${app}/injected-script`
}

export const MTypePopup = {
  GET_RANDOM_SEED: `@/${app}/generate-random-seed`,
  CREATE_ACCOUNT_BY_SEED: `@/${app}/set-account-by-seed-words`,

  SET_PASSWORD: `@/${app}/popup-set-password`,
  LOG_OUT: `@/${app}/popup-logout`,
  SET_SEED_AND_PASSWORD: `@/${app}/popup-set-seed-words-and-password`,

  POPUP_INIT: `@/${app}/popup-init`,

  EXPORT_SEED: `@/${app}/popup-export-seed-words`,
  EXPORT_PRIVATE_KEY: `@/${app}/popup-export-private-key`,

  IMPORT_PRIVATE_KEY: `@/${app}/popup-import-private-key`,
  IMPORT_KEYSTORE: `@/${app}/popup-import-keystore`,

  UPDATE_BALANCE: `@/${app}/popup-account-balance-upadte`,
  BUILD_TX_PARAMS: `@/${app}/popup-need-to-build-tx-params`,

  SIGN_AND_SEND: `@/${app}/popup-send-to-sign-tx`,
  DOMAIN_RESOLVE: `@/${app}/popup-resolve-domain`,
  REJECT_CONFIRM_TX: `@/${app}/popup-reject-confirm-tx`,

  SET_PROXY_STORAGE: `@/${app}/set-data-through-bg`,
}

export const MTypeTab = {
  GET_WALLET_DATA: `@/${app}/injected-get-wallet-data`,
  ADDRESS_CHANGED: `@/${app}/address-changed`,
  NETWORK_CHANGED: `@/${app}/network-changed`,
  LOCK_STAUS: `@/${app}/lack-status-updated`,

  CONTENT_PROXY_MEHTOD: `@/${app}/request-through-content`,
  CONTENT_PROXY_RESULT: `@/${app}/response-from-content`,

  CALL_TO_SIGN_TX: `@/${app}/request-to-sign-tx`,
  TX_RESULT: `@/${app}/response-tx-result`,

  CONNECT_APP: `@/${app}/request-to-connect-app`,
  RESPONSE_TO_DAPP: `@/${app}/response-connect-app`
}
