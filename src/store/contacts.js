/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */

const STORE_NAME = 'contacts'
const STATE_NAMES = {
  contactList: 'contactList'
}
const MUTATIONS_NAMES = {
  setContacts: 'setContacts'
}
const ACTIONS_NAMES = {
  onRemoveByIndex: 'onRemoveByIndex',
  onAddedContact: 'onAddedContact'
}
const GETTERS_NAMES = { }

const STORE = {
  namespaced: true,
  state: {
    [STATE_NAMES.contactList]: [
      {
        name: 'Ark warden.',
        address: '0x119929d8c388DE3650Ea1B3DC7b9Fe0ceEFE862F'
      },
      {
        name: 'Terrorblade.',
        address: '0x119929d8c388DE3650Ea1B3DC7b9Fe0ceEFE862F'
      },
      {
        name: 'Doom.',
        address: '0x119929d8c388DE3650Ea1B3DC7b9Fe0ceEFE862F'
      }
    ]
  },
  mutations: {
    [MUTATIONS_NAMES.setContacts](state, contactList) {
      if (!contactList || contactList.lenght < 1) {
        return null
      }

      state.contactList = contactList
    }
  },
  actions: {
    [ACTIONS_NAMES.onRemoveByIndex]({ commit, state }, index) {
      commit(
        MUTATIONS_NAMES.setContacts,
        state.contactList.filter((_, i) => index !== i)
      )
    },
    [ACTIONS_NAMES.onAddedContact]({ commit, state }, payload) {
      if (!payload || !payload.address || !payload.name) {
        return null
      }

      const newList = [...state.contactList, payload]

      commit(MUTATIONS_NAMES.setContacts, newList)
    }
  },
  getters: {}
}

export default {
  STORE_NAME,
  STORE,
  STATE_NAMES,
  MUTATIONS_NAMES,
  ACTIONS_NAMES,
  GETTERS_NAMES
}
