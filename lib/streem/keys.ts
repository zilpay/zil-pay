const app = 'BearBy';

export const MTypeTabContent = {
  CONTENT: `@/${app}/content-script`,
  INJECTED: `@/${app}/injected-script`
};

export const LegacyZilliqaTabMsg = {
  GET_WALLET_DATA: `@/${app}/injected-get-wallet-data`,
  ADDRESS_CHANGED: `@/${app}/address-changed`,
  NETWORK_CHANGED: `@/${app}/network-changed`,
  LOCK_STAUS: `@/${app}/lack-status-updated`,

  CONTENT_PROXY_MEHTOD: `@/${app}/request-through-content`,
  CONTENT_PROXY_RESULT: `@/${app}/response-from-content`,

  CALL_TO_SIGN_TX: `@/${app}/request-to-sign-tx`,
  TX_RESULT: `@/${app}/response-tx-result`,

  SIGN_MESSAGE: `@/${app}/request-to-sign-message`,
  SING_MESSAGE_RES: `@/${app}/response-sign-message`,

  NEW_BLOCK: `@/${app}/new-block-created`,

  CONNECT_APP: `@/${app}/request-to-connect-dapp`,
  RESPONSE_TO_DAPP: `@/${app}/response-dapp-connect`,
  DISCONNECT_APP: `@/${app}/request-to-disconnect-dapp`,

  WATCH_BLOCK: `@/${app}/request-watch_block`
};


