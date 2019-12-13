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
import P from 'src/components/P.vue'
import {
  BEM_CONFIG,
  COLOR_VARIANTS,
  FONT_VARIANTS
} from 'src/config'

const localVue = createLocalVue()

localVue.use(vueBemCn, { delimiters: BEM_CONFIG })

describe('components:P', () => {
  const wrapper = shallowMount(P, {
    localVue,
    propsData: {
      variant: COLOR_VARIANTS.primary,
      font: FONT_VARIANTS.medium
    }
  })

  it('Should be mount', () => {
    expect(wrapper).toBeTruthy()
  })

  it('checks the props', () => {
    expect(wrapper.props().variant).toEqual(COLOR_VARIANTS.primary)
    expect(wrapper.props().font).toEqual(FONT_VARIANTS.medium)
  })
})
