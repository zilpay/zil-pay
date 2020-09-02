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
import Chip from 'src/components/Chip.vue'
import {
  BEM_CONFIG,
  SIZE_VARIANS
} from 'src/config'
import { v4 as uuid } from 'uuid'

const TEST_TEXT = uuid()
const localVue = createLocalVue()

localVue.use(vueBemCn, { delimiters: BEM_CONFIG })

describe('components:Chip', () => {
  const wrapper = shallowMount(Chip, {
    localVue,
    propsData: {
      size: SIZE_VARIANS.md
    },
    slots: {
      default: [TEST_TEXT]
    }
  })

  it('Should can import', () => {
    expect(Chip).toBeTruthy()
  })

  it('Should be mount', () => {
    expect(wrapper).toBeTruthy()
  })

  it('checks the props', () => {
    expect(wrapper.props().size).toEqual(SIZE_VARIANS.md)
  })

  it('Should be have some class', () => {
    expect(wrapper.classes()).toEqual([
      Chip.name,
      `${Chip.name}${BEM_CONFIG.mod}size-md`
    ])
  })

  it('Should be have childran text', () => {
    expect(wrapper.text()).toEqual(TEST_TEXT)
  })

  it('Should be img div', () => {
    expect(wrapper.element.tagName).toEqual('SPAN')
  })

  it('Should can emit click event', () => {
    wrapper.vm.onClick()

    expect(wrapper.emitted().click).toBeTruthy()
  })

  it('Should can emit close event', () => {
    wrapper.vm.onClose()

    expect(wrapper.emitted().close).toBeTruthy()
  })
})
