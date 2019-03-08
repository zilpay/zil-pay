export const MTypesContent = {
  SET_NODE:        'set_node',      // Chenge new provider.
  SET_ADDRESS:     'set_address',   // Chenge address.
  INJECTED:        'inject_inpage', // Inpage script injected to page. 
  PAY_OBJECT_INIT: 'init_obj',      // Init object for dapp.
  CONTENT_INIT:    'init_content'   // init content script to browser.
};

export const MTypesInternal = {
  SET_ENCRYPT_SEED:      'set_seed',
  GET_ENCRYPT_SEED:      'get_seed',
  IS_UNLOCKED:           'is_unlocked',
  SET_PROMPT:            'set_prompt',
  GET_PROMPT:            'get_prompt',
  GET_ADDRESS:           'get_address',
  GET_NETWORK:           'get_network',
  SIGN_SEND_TRANSACTION: 'sign_send_transaction',
  WAIT_SEND_TRANSACTION: 'wait_send_transaction'
};