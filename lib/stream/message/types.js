// This string need that sould did't have problem with conflicts.
const app = 'zil-pay'

export const MTypeCommon = {
  SET_NET: `@/${app}/set-network`,
  SET_ADDRESS: `@/${app}/set-address`,
  STATUS_UPDATE: `@/${app}/wallet-status-update`,
  CONNECT_APP: `@/${app}/request-to-connect-app`
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
  POPUP_SET_NET: `@/${app}/popup-set-net`,
  
}

export const MTypeTab = {}
