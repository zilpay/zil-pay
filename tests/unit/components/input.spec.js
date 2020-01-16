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
    attrs: {
      type: INPUT_TYPES.number,
      placeholder: TEST_PLACEHOLDER,
      required: true,
      min: 10,
      max: 20,
      step: 1,
    },
    propsData: {
      size: SIZE_VARIANS.md,
      round: true,
      block: true,
      centred: false,
      autofocus: true,
      title: TEST_TITLE,
      error: TEST_ERROR,
      value: TEST_VALUE
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
    expect(wrapper.props().round).toBe(true)
    expect(wrapper.props().block).toEqual(true)
    expect(wrapper.props().title).toEqual(TEST_TITLE)
    expect(wrapper.props().error).toEqual(TEST_ERROR)
    expect(wrapper.props().value).toEqual(TEST_VALUE)
    expect(wrapper.props().autofocus).toEqual(true)
    expect(wrapper.props().centred).toEqual(false)
  })

  it('Should have some attributes', () => {
    expect(wrapper.attributes().class).toEqual('Input Input_block Input_size-md')
    expect(wrapper.attributes().type).toEqual(INPUT_TYPES.number)
    expect(wrapper.attributes().placeholder).toEqual(TEST_PLACEHOLDER)
    expect(wrapper.attributes().required).toEqual('required')
    expect(wrapper.attributes().min).toEqual('10')
    expect(wrapper.attributes().max).toEqual('20')
    expect(wrapper.attributes().step).toEqual('1')
  })

})
