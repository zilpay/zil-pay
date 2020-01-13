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
import Burger from 'src/components/icons/Burger.vue'
import {
  BEM_CONFIG,
  COLOR_VARIANTS
} from 'src/config'

const localVue = createLocalVue()

localVue.use(vueBemCn, { delimiters: BEM_CONFIG })

describe('components:Burger', () => {
  const wrapper = shallowMount(Burger, {
    localVue,
    propsData: {
      pointer: true
    }
  })

  it('Should can import', () => {
    expect(Burger).toBeTruthy()
  })

  it('Should be mount', () => {
    expect(wrapper).toBeTruthy()
  })

  it('Should be vue instance', () => {
    expect(wrapper.isVueInstance()).toBeTruthy()
  })

  it('checks the props', () => {
    expect(wrapper.props().height).toBe(13)
    expect(wrapper.props().width).toBe(19)
    expect(wrapper.props().pointer).toEqual(true)
    expect(wrapper.props().color).toEqual(COLOR_VARIANTS.primary)
  })

  it('Should be have some class', () => {
    expect(wrapper.classes()).toEqual([
      Burger.name,
      `${Burger.name}${BEM_CONFIG.mod}pointer`
    ])
  })

  it('Should be have some attributes', () => {
    expect(wrapper.attributes()).toEqual({
      class: `${Burger.name} ${Burger.name}${BEM_CONFIG.mod}pointer`,
      style: 'width: 19px; height: 13px;'
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
