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
import Radio from 'src/components/Radio.vue'
import { BEM_CONFIG } from 'src/config'

const localVue = createLocalVue()
const TEST_VALUE = true

localVue.use(vueBemCn, { delimiters: BEM_CONFIG })

describe('components:Radio', () => {
  const wrapper = shallowMount(Radio, {
    localVue,
    attrs: {
      required: true
    },
    propsData: {
      value: TEST_VALUE
    }
  })

  it('Should be import', () => {
    expect(Radio).toBeTruthy()
  })

  it('Should be vue instance', () => {
    expect(wrapper.isVueInstance()).toBeTruthy()
  })

  it('Should be mount', () => {
    expect(wrapper).toBeTruthy()
  })

  it('checks the props', () => {
    expect(wrapper.props().value).toBeTruthy()
  })

  it('Should have some attributes', () => {
    expect(wrapper.attributes().required).toEqual('required')
  })

  it('Should have some attributes', () => {
    expect(wrapper.attributes().required).toEqual('required')
  })

})
