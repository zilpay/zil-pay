/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import 'tests/extension-sinnon'

import ContactsStore from 'src/store/contacts'
import { v4 } from 'uuid'
import { FIELDS } from 'config'
import { BrowserStorage, BuildObject } from 'lib/storage'

const storage = new BrowserStorage()
const {
  state,
  namespaced,
  mutations,
  actions,
  getters
} = ContactsStore.STORE

const actionProvider = {
  state,
  commit: (key, value) => {
    mutations[key](state, value)
  },
  rootState: {
    ui: {
      local: {
        MUST_BE_UNIQUE: v4()
      }
    }
  }
}

describe('store:contacts', () => {
  it('should have STORE object', () => {
    expect(ContactsStore.STORE).toBeTruthy()
    expect(state).toBeTruthy()
    expect(namespaced).toBeTruthy()
    expect(mutations).toBeTruthy()
    expect(actions).toBeTruthy()
    expect(getters).toBeTruthy()
  })

  it('should have some propirties of state', () => {
    const keys = Object.keys(state)

    expect(Array.isArray(state.contactList)).toBeTruthy()
    expect(keys.length).toBe(1)
  })

  it('should have some mutations', () => {
    const keys = Object.keys(mutations)

    expect(mutations.setContacts).toBeTruthy()
    expect(keys.length).toBe(1)
  })

  it('should have some actions', () => {
    const keys = Object.keys(actions)

    expect(actions.onRemoveByIndex).toBeTruthy()
    expect(actions.onAddedContact).toBeTruthy()
    expect(actions.onUpdateContact).toBeTruthy()
    expect(actions.onUpdate).toBeTruthy()
    expect(keys.length).toBe(4)
  })

  it('should have some getters', () => {
    const keys = Object.keys(getters)

    expect(keys.length).toBe(0)
  })

  it('try setContacts', () => {
    const contactList = [
      {
        address: v4(),
        name: v4().slice(30)
      },
      {
        address: v4(),
        name: v4().slice(30)
      },
      {
        address: v4(),
        name: v4().slice(30)
      }
    ]

    mutations.setContacts(state, null)
    mutations.setContacts(state, {})
    mutations.setContacts(state, undefined)
    mutations.setContacts(state, 0)
    mutations.setContacts(state, '')

    expect(state.contactList).toEqual([])


    mutations.setContacts(state, contactList)

    expect(state.contactList).toEqual(contactList)

    actions.onRemoveByIndex(actionProvider, 2)

    expect(state.contactList).toEqual([
      contactList[0],
      contactList[1]
    ])
  })

  it('try add contact', () => {
    const notUniqueContact = state.contactList[0]
    const newContact = {
      address: v4(),
      name: v4().slice(30)
    }

    actions.onAddedContact(actionProvider, 0)
    actions.onAddedContact(actionProvider, null)
    actions.onAddedContact(actionProvider, {})

    try {
      actions.onAddedContact(actionProvider, notUniqueContact)
    } catch (err) {
      expect(err.message).toBe(actionProvider.rootState.ui.local.MUST_BE_UNIQUE)
    }

    actions.onAddedContact(actionProvider, newContact)

    expect(state.contactList[2]).toEqual(newContact)
  })

  it('try update contact', () => {
    const newName = v4().slice(30)

    actions.onUpdateContact(actionProvider, {
      payload: {
        ...state.contactList[0],
        name: newName
      },
      index: 0
    })

    expect(state.contactList[0].name).toBe(newName)
  })

  it('try getfrom storage', async() => {
    const contactList = [
      {
        address: v4(),
        name: v4().slice(30)
      },
      {
        address: v4(),
        name: v4().slice(30)
      },
      {
        address: v4(),
        name: v4().slice(30)
      }
    ]

    state.contactList = []

    await storage.set([
      new BuildObject(FIELDS.CONTACTS, contactList)
    ])

    expect(state.contactList).toEqual([])

    await actions.onUpdate(actionProvider)

    expect(state.contactList).toEqual(contactList)
  })
})
