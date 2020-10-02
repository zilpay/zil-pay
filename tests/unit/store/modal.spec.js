/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import ModalStore from 'src/store/modal'

const {
  state,
  namespaced,
  mutations,
  actions,
  getters
} = ModalStore.STORE

describe('store:modal', () => {
  it('should have STORE object', () => {
    expect(ModalStore.STORE).toBeTruthy()
    expect(state).toBeTruthy()
    expect(namespaced).toBeTruthy()
    expect(mutations).toBeTruthy()
    expect(actions).toBeTruthy()
    expect(getters).toBeTruthy()
  })

  it('should have some propirties of state', () => {
    const keys = Object.keys(state)

    expect(state.sideBarSettings).toBeDefined()
    expect(state.sendModal).toBeDefined()
    expect(state.receiveModal).toBeDefined()
    expect(state.accountModal).toBeDefined()

    expect(state.sendModal).toEqual({
      step: 0,
      show: false,
      payload: { address: '' }
    })
    expect(state.receiveModal).toEqual({
      step: 0,
      show: false,
      payload: null
    })
    expect(state.accountModal).toEqual({
      step: 0,
      show: false,
      payload: null
    })

    expect(keys.length).toBe(4)
  })

  it('should have some mutations', () => {
    const keys = Object.keys(mutations)

    expect(mutations.toggleSideBarSettings).toBeDefined()
    expect(mutations.setShowSendModal).toBeDefined()
    expect(mutations.setShowReceiveModal).toBeDefined()
    expect(mutations.setShowAccountModal).toBeDefined()
    expect(mutations.setNextStep).toBeDefined()
    expect(mutations.setPreviousStep).toBeDefined()
    expect(mutations.setNumberStep).toBeDefined()
    expect(mutations.setSendModalPayload).toBeDefined()

    expect(keys.length).toBe(8)
  })

  it('should have some actions', () => {
    const keys = Object.keys(actions)

    expect(keys.length).toBe(0)
  })

  it('should have some getters', () => {
    const keys = Object.keys(getters)

    expect(keys.length).toBe(0)
  })

  it('try toggle SideBar', () => {
    expect(state.sideBarSettings).toBe(false)

    mutations.toggleSideBarSettings(state)

    expect(state.sideBarSettings).toBe(true)

    mutations.toggleSideBarSettings(state)

    expect(state.sideBarSettings).toBe(false)
  })

  it('try toggle sendModal', () => {
    expect(state.sideBarSettings).toBe(false)
    expect(state.receiveModal.show).toBe(false)
    expect(state.accountModal.show).toBe(false)
    expect(state.sendModal.show).toBe(false)
    expect(state.sendModal.step).toBe(0)

    mutations.setShowSendModal(state)
    mutations.setNextStep(state)

    expect(state.sideBarSettings).toBe(false)
    expect(state.receiveModal.show).toBe(false)
    expect(state.accountModal.show).toBe(false)
    expect(state.sendModal.show).toBe(true)
    expect(state.sendModal.step).toBe(1)

    mutations.setShowSendModal(state)
  })

  it('try toggle receiveModal', () => {
    expect(state.sideBarSettings).toBe(false)
    expect(state.receiveModal.show).toBe(false)
    expect(state.accountModal.show).toBe(false)
    expect(state.sendModal.show).toBe(false)
    expect(state.receiveModal.step).toBe(0)

    mutations.setShowReceiveModal(state)
    mutations.setNextStep(state)

    expect(state.sideBarSettings).toBe(false)
    expect(state.receiveModal.show).toBe(true)
    expect(state.accountModal.show).toBe(false)
    expect(state.sendModal.show).toBe(false)
    expect(state.receiveModal.step).toBe(1)

    mutations.setShowReceiveModal(state)
  })

  it('try toggle set Show Account Modal', () => {
    expect(state.sideBarSettings).toBe(false)
    expect(state.receiveModal.show).toBe(false)
    expect(state.accountModal.show).toBe(false)
    expect(state.sendModal.show).toBe(false)
    expect(state.accountModal.step).toBe(0)

    mutations.setShowAccountModal(state)
    mutations.setNextStep(state)

    expect(state.sideBarSettings).toBe(false)
    expect(state.receiveModal.show).toBe(false)
    expect(state.accountModal.show).toBe(true)
    expect(state.sendModal.show).toBe(false)
    expect(state.accountModal.step).toBe(1)

    mutations.setShowSendModal(state)
  })
})
