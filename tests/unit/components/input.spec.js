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
import Input, { INPUT_TYPES } from 'src/components/Input.vue'
import { uuid } from 'uuidv4'
import {
  BEM_CONFIG,
  SIZE_VARIANS
} from 'src/config'

const localVue = createLocalVue()
const TEST_TITLE = uuid()
const TEST_ERROR = uuid()
const TEST_VALUE = uuid()
const TEST_PLACEHOLDER = uuid()

localVue.use(vueBemCn, { delimiters: BEM_CONFIG })

describe('components:Input', () => {
  const wrapper = shallowMount(Input, {
    localVue,
    propsData: {
      size: SIZE_VARIANS.md,
      disabled: false,
      round: true,
      block: true,
      type: INPUT_TYPES.number,
      min: 10,
      max: 20,
      step: 1,
      centred: false,
      autofocus: true,
      title: TEST_TITLE,
      error: TEST_ERROR,
      placeholder: TEST_PLACEHOLDER,
      value: TEST_VALUE,
      required: true
    }
  })

  it('Should be import', () => {
    expect(Input).toBeTruthy()
    expect(INPUT_TYPES).toBeTruthy()
  })

  it('Should be vue instance', () => {
    expect(wrapper.isVueInstance()).toBeTruthy()
  })

  it('Should be mount', () => {
    expect(wrapper).toBeTruthy()
  })

  it('checks the props', () => {
    expect(wrapper.props().size).toEqual(SIZE_VARIANS.md)
    expect(wrapper.props().disabled).toBe(false)
    expect(wrapper.props().round).toBe(true)
    expect(wrapper.props().block).toEqual(true)
    expect(wrapper.props().placeholder).toEqual(TEST_PLACEHOLDER)
    expect(wrapper.props().title).toEqual(TEST_TITLE)
    expect(wrapper.props().error).toEqual(TEST_ERROR)
    expect(wrapper.props().value).toEqual(TEST_VALUE)
    expect(wrapper.props().type).toEqual(INPUT_TYPES.number)
    expect(wrapper.props().min).toEqual(10)
    expect(wrapper.props().max).toEqual(20)
    expect(wrapper.props().step).toEqual(1)
    expect(wrapper.props().required).toEqual(true)
    expect(wrapper.props().autofocus).toEqual(true)
    expect(wrapper.props().centred).toEqual(false)
  })

})
