/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { FIELDS } from 'config'
import { BrowserStorage } from 'lib/storage'
import { changeContacts } from '@/services'
import { TypeChecker } from 'lib/type'

const storage = new BrowserStorage()

const STORE_NAME = 'contacts'
const STATE_NAMES = {
  contactList: 'contactList'
}
const MUTATIONS_NAMES = {
  setContacts: 'setContacts'
}
const ACTIONS_NAMES = {
  onRemoveByIndex: 'onRemoveByIndex',
  onAddedContact: 'onAddedContact',
  onUpdateContact: 'onUpdateContact',
  onUpdate: 'onUpdate'
}
const GETTERS_NAMES = { }

const STORE = {
  namespaced: true,
  state: {
    [STATE_NAMES.contactList]: []
  },
  mutations: {
    [MUTATIONS_NAMES.setContacts](state, contactList) {
      if (!new TypeChecker(contactList).isArray) {
        return null
      }

      for (var i = 0; i < contactList.length; i++) {
        const payload = contactList[i]

        if (!payload || !payload.name || !payload.address) {
          return null
        }
      }

      state.contactList = contactList

      changeContacts(contactList)
    }
  },
  actions: {
    [ACTIONS_NAMES.onRemoveByIndex]({ commit, state }, index) {
      commit(
        MUTATIONS_NAMES.setContacts,
        state.contactList.filter((_, i) => index !== i)
      )
    },
    [ACTIONS_NAMES.onAddedContact]({ commit, state, rootState }, payload) {
      if (!new TypeChecker(payload).isObject) {
        return null
      } else if (state.contactList.some((contact) => (payload && contact.address === payload.address))) {
        throw new Error(rootState.ui.local.MUST_BE_UNIQUE)
      }

      const newList = [...state.contactList, payload]

      commit(MUTATIONS_NAMES.setContacts, newList)
    },
    [ACTIONS_NAMES.onUpdateContact]({ commit, state }, { payload, index }) {
      if (!new TypeChecker(payload).isObject) {
        return null
      } else if (!new TypeChecker(index).isInt) {
        return null
      }

      const newList = state.contactList

      newList[index] = payload

      commit(MUTATIONS_NAMES.setContacts, newList)
    },
    async [ACTIONS_NAMES.onUpdate]({ commit }) {
      const contacts = await storage.get(FIELDS.CONTACTS)

      commit(MUTATIONS_NAMES.setContacts, contacts)
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
