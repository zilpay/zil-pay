/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import Vuex from 'vuex'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import vueBemCn from 'vue-bem-cn'
import FastPanel from 'src/components/FastPanel.vue'
import { BEM_CONFIG } from 'src/config'
import store from 'src/store'

const localVue = createLocalVue()

localVue.use(vueBemCn, { delimiters: BEM_CONFIG })
localVue.use(Vuex)

describe('components:FastPanel', () => {
  const wrapper = shallowMount(FastPanel, {
    localVue,
    store
  })

  it('Should can import', () => {
    expect(FastPanel).toBeTruthy()
  })

  it('Should be mount', () => {
    expect(wrapper).toBeTruthy()
  })

  it('Should be vue instance', () => {
    expect(wrapper.isVueInstance()).toBeTruthy()
  })

  it('Should be have some class', () => {
    expect(wrapper.classes()).toEqual([
      FastPanel.name
    ])
  })

  it('Should be div tag', () => {
    expect(wrapper.element.tagName).toEqual('DIV')
  })

  it('Should have data object', () => {
    expect(wrapper.vm.$data.width).toBeTruthy()
    expect(wrapper.vm.$data.height).toBeTruthy()
  })
})
