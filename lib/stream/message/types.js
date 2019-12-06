// This string need that sould did't have problem with conflicts.
const app = 'zil-pay'

export const MTypeCommon = {
}

export const MTypeSecure = {
  CONTENT: `@/${app}/content-script`,
  INJECTED: `@/${app}/injected-script`
}

export const MTypePopup = {}

export const MTypeInpage = {
  INJECTED_INIT: `@/${app}/injected-script-init`
}

export const MTypeBackground = {
  POPUP_INIT: `@/${app}/popup-init`,
  POPUP_SET_NET: `@/${app}/popup-set-net`
}

export const MTypeTab = {
  CONTENT_PROXY_MEHTOD: `@/${app}/request-through-content`,
  CONTENT_PROXY_RESULT: `@/${app}/response-from-content`,

  CALL_SIGN_TX: `@/${app}/request-to-sign-tx`,
  TX_RESULT: `@/${app}/response-tx-result`,

  CONNECT_APP: `@/${app}/request-to-connect-app`,

  SET_NET: `@/${app}/set-network`,
  SET_ADDRESS: `@/${app}/set-address`,
  STATUS_UPDATE: `@/${app}/wallet-status-update`
}
