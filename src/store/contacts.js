/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
export default {
  namespaced: true,
  state: {
    contactList: [
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
    setContacts(state, contactList) {
      if (!contactList || contactList.lenght < 1) {
        return null
      }

      state.contactList = contactList
    }
  },
  actions: {
    onRemoveByIndex({ commit, state }, index) {
      commit(
        'setContacts',
        state.contactList.filter((_, i) => index !== i)
      )
    },
    onAddedContact({ commit, state }, payload) {
      if (!payload || !payload.address || !payload.name) {
        return null
      }

      const onlyAddreses = state.contactList.filter(c => c.address)
      const onlyName = state.contactList.filter(c => c.name)

      if (onlyAddreses.includes(payload.address)) {
        throw new Error('Address must be unique.')
      } else if (onlyName.includes(payload.name)) {
        throw new Error('Name must be unique.')
      }

      const newList = [...state.contactList, payload]

      commit('setContacts', newList)
    }
  },
  getters: {}
}
