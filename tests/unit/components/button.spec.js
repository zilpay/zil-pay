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

const localVue = createLocalVue()

localVue.use(vueBemCn, { delimiters: BEM_CONFIG })

describe('components:Button', () => {
  const wrapper = shallowMount(Button, {
    localVue,
    propsData: {
      size: SIZE_VARIANS.md,
      color: COLOR_VARIANTS.info,
      disabled: false,
      round: true,
      block: true
    }
  })

  it('Should be mount', () => {
    expect(wrapper).toBeTruthy()
  })

  it('checks the props  ', () => {
    expect(wrapper.props().size).toEqual(SIZE_VARIANS.md)
    expect(wrapper.props().color).toEqual(COLOR_VARIANTS.info)
    expect(wrapper.props().disabled).toBe(false)
    expect(wrapper.props().round).toBe(true)
    expect(wrapper.props().block).toEqual(true)
  })
})
