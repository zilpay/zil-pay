/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { shallowMount, createLocalVue } from '@vue/test-utils'
import vueBemCn from 'vue-bem-cn'
import Close from 'src/components/icons/Close.vue'
import {
  BEM_CONFIG,
  SIZE_VARIANS
} from 'src/config'

const localVue = createLocalVue()

localVue.use(vueBemCn, { delimiters: BEM_CONFIG })

describe('components:Close', () => {
  const wrapper = shallowMount(Close, {
    localVue,
    propsData: {
      height: 300,
      width: 10,
      pointer: true
    }
  })

  it('Should can import', () => {
    expect(Close).toBeTruthy()
  })

  it('Should be mount', () => {
    expect(wrapper).toBeTruthy()
  })

  it('Should be vue instance', () => {
    expect(wrapper.isVueInstance()).toBeTruthy()
  })

  it('checks the props', () => {
    expect(wrapper.props().size).toEqual(SIZE_VARIANS.xs)
    expect(wrapper.props().pointer).toEqual(true)
  })

  it('Should be have some class', () => {
    expect(wrapper.classes()).toEqual([
      Close.name,
      `${Close.name}${BEM_CONFIG.mod}pointer`,
      `${Close.name}${BEM_CONFIG.mod}size-xs`
    ])
  })

  it('Should be have some attributes', () => {
    expect(wrapper.attributes()).toEqual({
      height: '300',
      width: '10',
      class: `${Close.name} ${Close.name}${BEM_CONFIG.mod}pointer ${Close.name}${BEM_CONFIG.mod}size-xs`
    })
  })

  it('Should be img div', () => {
    expect(wrapper.element.tagName).toEqual('DIV')
  })

  it('Should can emit click event', () => {
    wrapper.vm.onClick()

    expect(wrapper.emitted().click).toBeTruthy()
  })
})
