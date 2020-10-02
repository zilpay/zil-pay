/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import ContactsStore from 'src/store/contacts'

const {
  state,
  namespaced,
  mutations,
  actions,
  getters
} = ContactsStore.STORE

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
})
