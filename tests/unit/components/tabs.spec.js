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
import Tabs from 'src/components/Tabs.vue'
import { BEM_CONFIG } from 'src/config'
import { v4 as uuid } from 'uuid'

const localVue = createLocalVue()

localVue.use(vueBemCn, { delimiters: BEM_CONFIG })

const TEST_TABS = [
  {
    name: uuid(),
    event: uuid()
  },
  {
    name: uuid(),
    event: uuid()
  }
]

describe('components:Tabs', () => {
  const wrapper = shallowMount(Tabs, {
    localVue,
    propsData: {
      elements: TEST_TABS
    }
  })

  it('Should be mount', () => {
    expect(wrapper).toBeTruthy()
  })

  it('Should can import', () => {
    expect(Tabs).toBeTruthy()
  })

  it('Should be have some class', () => {
    expect(wrapper.classes()).toEqual([
      Tabs.name
    ])
  })

  it('Should be some props', () => {
    expect(wrapper.props().elements).toEqual(TEST_TABS)
  })

  it('Should be have some attributes', () => {
    expect(wrapper.attributes().class).toEqual(Tabs.name)
  })

  it('Should be img div', () => {
    expect(wrapper.element.tagName).toEqual('DIV')
  })

  it('Should can emit change event', () => {
    wrapper.vm.onChange()

    expect(wrapper.emitted().input).toBeTruthy()
  })
})
