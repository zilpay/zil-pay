export const MTypesSecure = {
  SET_NODE:        'set_node',      // Chenge new provider.
  SET_ADDRESS:     'set_address',   // Chenge address.
  INJECTED:        'inject_inpage', // Inpage script injected to page.
  PAY_OBJECT_INIT: 'init_obj',      // Init object for dapp.
  CONTENT:         'init_content',  // init content script to browser.
  SYNC:            'sync',
  STATUS_UPDATE:   's_update',
  ERROR:           'error'
};

export const MTypesAuth = {
  SET_PASSWORD:     'set_password',
  SET_SEED_AND_PWD: 'set_seed_and_pwd',
  EXPORT_SEED:      'export_seed',
  LOG_OUT:          'log_out'
}

export const MTypesZilPay = {
  INIT_DATA:         'init_data',
  CALL_SIGN_TX:      'c_s_t',
  
  GET_CONFIRM_TX:    'g_c_t',
  REJECT_CONFIRM_TX: 'r_c_t',
  CONFIRM_TX:        'c_t'
};

export const MTypesInternal = {
  INIT:                  'init',
  SET_NET:               'set_net',
  GET_NETWORK:           'get_network',
  GET_ADDRESS:           'get_address',
  GET_DECRYPT_SEED:      'get_d_seed',
  GET_ALL_TX:            'get_all_tx',
  UPDATE_BALANCE:        'update_balance',
  CHANGE_ACCOUNT:        'c_account',
  CREATE_ACCOUNT:        'create_account'
};

export const MTypesTabs = {
  ADDRESS_CHANGED: 'address_changed',
  NETWORK_CHANGED: 'network_changed',
  LOCK_STAUS:      'lock_status',
  TX_RESULT:       'tx_result'
};

export const exportTypes = {
  PRIVATE_KEY: 'privKey',
  SEED:        'seed'
};