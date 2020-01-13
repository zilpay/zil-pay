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
import Status from 'src/components/icons/Status.vue'
import {
  BEM_CONFIG,
  COLOR_VARIANTS
} from 'src/config'

const localVue = createLocalVue()

localVue.use(vueBemCn, { delimiters: BEM_CONFIG })

describe('components:Status', () => {
  const wrapper = shallowMount(Status, {
    localVue,
    propsData: {
      pointer: true,
      color: COLOR_VARIANTS.primary
    }
  })

  it('Should can import', () => {
    expect(Status).toBeTruthy()
  })

  it('Should be mount', () => {
    expect(wrapper).toBeTruthy()
  })

  it('Should be vue instance', () => {
    expect(wrapper.isVueInstance()).toBeTruthy()
  })

  it('checks the props', () => {
    expect(wrapper.props().pointer).toEqual(true)
    expect(wrapper.props().color).toEqual(COLOR_VARIANTS.primary)
  })

  it('Should be have some class', () => {
    expect(wrapper.classes()).toEqual([
      Status.name,
      `${Status.name}${BEM_CONFIG.mod}pointer`
    ])
  })

  it('Should be have some attributes', () => {
    expect(wrapper.attributes()).toEqual({
      class: `${Status.name} ${Status.name}${BEM_CONFIG.mod}pointer`,
      viewBox: '0 0 15 15',
      height: '15',
      width: '15'
    })
  })

  it('Should be img svg', () => {
    expect(wrapper.element.tagName).toEqual('svg')
  })

  it('Should can emit click event', () => {
    wrapper.vm.onClick()

    expect(wrapper.emitted().click).toBeTruthy()
  })
})
