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
import Connections from 'src/components/icons/Connections.vue'
import {
  BEM_CONFIG,
  COLOR_VARIANTS
} from 'src/config'

const localVue = createLocalVue()

localVue.use(vueBemCn, { delimiters: BEM_CONFIG })

describe('components:Connections', () => {
  const wrapper = shallowMount(Connections, {
    localVue,
    propsData: {
      pointer: true,
      color: COLOR_VARIANTS.primary
    }
  })

  it('Should can import', () => {
    expect(Connections).toBeTruthy()
  })

  it('Should be mount', () => {
    expect(wrapper).toBeTruthy()
  })

  it('checks the props', () => {
    expect(wrapper.props().pointer).toEqual(true)
    expect(wrapper.props().color).toEqual(COLOR_VARIANTS.primary)
  })

  it('Should be have some class', () => {
    expect(wrapper.classes()).toEqual([
      Connections.name,
      `${Connections.name}${BEM_CONFIG.mod}pointer`
    ])
  })

  it('Should be have some attributes', () => {
    expect(wrapper.attributes()).toEqual({
      class: `${Connections.name} ${Connections.name}${BEM_CONFIG.mod}pointer`,
      viewBox: '0 0 19 18'
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
