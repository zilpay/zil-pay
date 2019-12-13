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
import Icon from 'src/components/Icon.vue'
import {
  BEM_CONFIG,
  ICON_TYPE,
  ICON_VARIANTS
} from 'src/config'

const localVue = createLocalVue()

localVue.use(vueBemCn, { delimiters: BEM_CONFIG })

describe('components:Icon', () => {
  const wrapper = shallowMount(Icon, {
    localVue,
    propsData: {
      icon: ICON_VARIANTS.logo,
      type: ICON_TYPE.svg,
      height: 300,
      width: 10,
      pointer: true
    }
  })

  it('Should be mount', () => {
    expect(wrapper).toBeTruthy()
  })

  it('checks the props', () => {
    expect(wrapper.props().icon).toEqual(ICON_VARIANTS.logo)
    expect(wrapper.props().type).toEqual(ICON_TYPE.svg)
    expect(wrapper.props().height).toBe(300)
    expect(wrapper.props().width).toBe(10)
    expect(wrapper.props().pointer).toEqual(true)
  })
})
