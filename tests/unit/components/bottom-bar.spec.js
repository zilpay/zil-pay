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
import BottomBar from 'src/components/BottomBar.vue'
import { uuid } from 'uuidv4'
import {
  ICON_TYPE,
  ICON_VARIANTS,
  COLOR_VARIANTS,
  SIZE_VARIANS,
  BEM_CONFIG
} from 'src/config'

const localVue = createLocalVue()

const TEST = [
  {
    value: 'Send',
    event: 'send',
    icon: ICON_VARIANTS.add,
    iconType: ICON_TYPE.svg,
    variant: COLOR_VARIANTS.primary,
    size: SIZE_VARIANS.sm,
    uuid: uuid()
  },
  {
    value: 'Receive',
    event: 'receive',
    icon: ICON_VARIANTS.add,
    iconType: ICON_TYPE.svg,
    variant: COLOR_VARIANTS.primary,
    size: SIZE_VARIANS.sm,
    uuid: uuid()
  }
]

localVue.use(vueBemCn, { delimiters: BEM_CONFIG })

describe('components:BottomBar', () => {
  const wrapper = shallowMount(BottomBar, {
    localVue,
    propsData: {
      elements: TEST
    }
  })

  it('Should be vue instance', () => {
    expect(wrapper.isVueInstance()).toBeTruthy()
  })

  it('Should can imported', () => {
    expect(BottomBar).toBeTruthy()
  })

  it('Should be mount', () => {
    expect(wrapper).toBeTruthy()
  })

  it('checks the props', () => {
    expect(wrapper.props().elements).toEqual(TEST)
  })

  it('Should be have some class', () => {
    expect(wrapper.classes()[0]).toEqual(BottomBar.name)
  })

})
