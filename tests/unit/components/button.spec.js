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
import Button from 'src/components/Button.vue'
import {
  BEM_CONFIG,
  SIZE_VARIANS,
  COLOR_VARIANTS
} from 'src/config'
import { uuid } from 'uuidv4'

const TEST_TEXT = uuid()
const localVue = createLocalVue()

localVue.use(vueBemCn, { delimiters: BEM_CONFIG })

describe('components:Button', () => {
  const wrapper = shallowMount(Button, {
    localVue,
    propsData: {
      size: SIZE_VARIANS.md,
      color: COLOR_VARIANTS.info,
      round: true,
      block: true
    },
    slots: {
      default: [TEST_TEXT]
    }
  })

  it('Should can import', () => {
    expect(Button).toBeTruthy()
  })

  it('Should be mount', () => {
    expect(wrapper).toBeTruthy()
  })

  it('Should be vue instance', () => {
    expect(wrapper.isVueInstance()).toBeTruthy()
  })

  it('checks the props', () => {
    expect(wrapper.props().size).toEqual(SIZE_VARIANS.md)
    expect(wrapper.props().color).toEqual(COLOR_VARIANTS.info)
    expect(wrapper.props().round).toBe(true)
    expect(wrapper.props().block).toEqual(true)
  })

  it('Should be have some class', () => {
    expect(wrapper.classes()).toEqual([
      Button.name,
      `${Button.name}${BEM_CONFIG.mod}round`,
      `${Button.name}${BEM_CONFIG.mod}block`,
      `${Button.name}${BEM_CONFIG.mod}size-md`,
      `${Button.name}${BEM_CONFIG.mod}color-info`
    ])
  })

  it('Should be have childran text', () => {
    expect(wrapper.text()).toEqual(TEST_TEXT)
  })

  it('Should be img button', () => {
    expect(wrapper.element.tagName).toEqual('BUTTON')
  })

  it('Should can emit click event', () => {
    wrapper.vm.onClick()

    expect(wrapper.emitted().click).toBeTruthy()
  })
})
