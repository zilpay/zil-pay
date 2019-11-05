import extensionAPI from 'extensionizer';

let EX_ID = null;
const ENTROPY_CODE = `zilpay-b52c-4d36-bde2-6524bdf511c9`;


if (process.env.NODE_ENV !== 'test') {
  EX_ID = extensionAPI.runtime.id;
}

export const MTypesSecure = {
  // Types message for sending between (content.js, in page.js) //
  SET_NODE:        `set_node-${ENTROPY_CODE}`,
  SET_ADDRESS:     `set_address-${ENTROPY_CODE}`,
  INJECTED:        `inject_inpage-${ENTROPY_CODE}`,
  PAY_OBJECT_INIT: `init_obj-${ENTROPY_CODE}`,
  CONTENT:         `init_content-${ENTROPY_CODE}`,
  SYNC:            `sync-${ENTROPY_CODE}`,
  STATUS_UPDATE:   `s_update-${ENTROPY_CODE}`,
  CONNECT:         `connect_request-${ENTROPY_CODE}`
};

export const MTypesAuth = {
  // Types message for authentication methods. //
  SET_PASSWORD:     `set_password-${ENTROPY_CODE}-${EX_ID}`,
  SET_SEED_AND_PWD: `set_seed_and_pwd-${ENTROPY_CODE}-${EX_ID}`,
  EXPORT_SEED:      `export_seed-${ENTROPY_CODE}-${EX_ID}`,
  EXPORT_PRIV_KEY:  `export_priv_key-${ENTROPY_CODE}-${EX_ID}`,
  IMPORT_PRIV_KEY:  `import_priv_key-${ENTROPY_CODE}-${EX_ID}`,
  IMPORT_BY_HW:     `import_by_hardware-${ENTROPY_CODE}-${EX_ID}`,
  LOG_OUT:          `log_out-${ENTROPY_CODE}-${EX_ID}`
}

export const MTypesZilPay = {
  // Types message for call methods from dapps. //
  INIT_DATA:         `init_data-${ENTROPY_CODE}`,
  CALL_SIGN_TX:      `c_s_t-${ENTROPY_CODE}`,
  BUILD_TX_PARAMS:   `build_tx_params-${ENTROPY_CODE}`,
  SEND_SIGN_TX:      `send_sign_tx-${ENTROPY_CODE}`,
  
  GET_CONFIRM_TX:    `g_c_t-${ENTROPY_CODE}`,
  REJECT_CONFIRM_TX: `r_c_t-${ENTROPY_CODE}`,
  CONFIRM_TX:        `c_t-${ENTROPY_CODE}`,
  PROXY_MEHTOD:      `proxy_provider-${ENTROPY_CODE}`,
  PROXY_RESULT:      `result_proxy-${ENTROPY_CODE}`,
  CONFIRM_DAPP:      `allow_dapp-${ENTROPY_CODE}`
};

export const MTypesInternal = {
  INIT:                  `init-${ENTROPY_CODE}-${EX_ID}`,
  SET_NET:               `set_net-${ENTROPY_CODE}-${EX_ID}`,
  GET_NETWORK:           `get_network-${ENTROPY_CODE}-${EX_ID}`,
  GET_ADDRESS:           `get_address-${ENTROPY_CODE}-${EX_ID}`,
  GET_DECRYPT_SEED:      `get_d_seed-${ENTROPY_CODE}-${EX_ID}`,
  GET_ALL_TX:            `get_all_tx-${ENTROPY_CODE}-${EX_ID}`,
  UPDATE_BALANCE:        `update_balance-${ENTROPY_CODE}-${EX_ID}`,
  CHANGE_ACCOUNT:        `c_account-${ENTROPY_CODE}-${EX_ID}`,
  CREATE_ACCOUNT:        `create_account-${ENTROPY_CODE}-${EX_ID}`,
  CONFIG_UPDATE:         `config_update-${ENTROPY_CODE}-${EX_ID}`,
  ACC_CHANGE_NAME:       `change_account_name-${ENTROPY_CODE}-${EX_ID}`,
  CLEAR_HISTORY_TX:      `clear_history-${ENTROPY_CODE}-${EX_ID}`,
  GET_UD_OWNER:          `get_ud_owner-${ENTROPY_CODE}-${EX_ID}`
};

export const MTypesTabs = {
  ADDRESS_CHANGED: `address_changed-${ENTROPY_CODE}`,
  NETWORK_CHANGED: `network_changed-${ENTROPY_CODE}`,
  CONNECT_TO_DAPP: `connection_to_dapp-${ENTROPY_CODE}`,
  LOCK_STAUS:      `lock_status-${ENTROPY_CODE}`,
  TX_RESULT:       `tx_result-${ENTROPY_CODE}`
};

export const exportTypes = {
  PRIVATE_KEY: `privKey-${ENTROPY_CODE}-${EX_ID}`,
  SEED:        `seed-${ENTROPY_CODE}-${EX_ID}`
};
