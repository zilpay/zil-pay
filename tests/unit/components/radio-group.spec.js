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
import RadioGroup from 'src/components/RadioGroup.vue'
import { BEM_CONFIG } from 'src/config'
import { uuid } from 'uuidv4'

const localVue = createLocalVue()
const TEST_VALUE = 0
const TEST_TEXT = uuid()
const TEST_ELEMENTS = [uuid(), uuid()]

localVue.use(vueBemCn, { delimiters: BEM_CONFIG })

describe('components:RadioGroup', () => {
  const wrapper = shallowMount(RadioGroup, {
    localVue,
    propsData: {
      value: TEST_VALUE,
      elements: TEST_ELEMENTS
    },
    slots: {
      default: [TEST_TEXT]
    }
  })

  it('Should be import', () => {
    expect(RadioGroup).toBeTruthy()
  })

  it('Should be vue instance', () => {
    expect(wrapper.isVueInstance()).toBeTruthy()
  })

  it('Should be mount', () => {
    expect(wrapper).toBeTruthy()
  })

  it('checks the props', () => {
    expect(wrapper.props().value).toBe(TEST_VALUE)
    expect(wrapper.props().elements).toBe(TEST_ELEMENTS)
  })

  it('Should be img div', () => {
    expect(wrapper.element.tagName).toEqual('DIV')
  })

  it('Should be have childran text', () => {
    expect(wrapper.text().includes(TEST_TEXT)).toBeTruthy()
  })

  it('Should can emit input event', () => {
    wrapper.vm.onInput(TEST_ELEMENTS[0])

    expect(wrapper.emitted().input).toEqual([
      [TEST_ELEMENTS[0]]
    ])
  })

})
