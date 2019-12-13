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
import TopBar from 'src/components/TopBar.vue'
import {
  BEM_CONFIG,
  ICON_VARIANTS
} from 'src/config'

const localVue = createLocalVue()

localVue.use(vueBemCn, { delimiters: BEM_CONFIG })

describe('components:TopBar', () => {
  const wrapper = shallowMount(TopBar, {
    localVue,
    propsData: {
      left: true,
      text: 'test',
      icon: ICON_VARIANTS.cancel
    }
  })

  it('Should be mount', () => {
    expect(wrapper).toBeTruthy()
  })

  it('checks the props', () => {
    expect(wrapper.props().left).toBe(true)
    expect(wrapper.props().right).toBe(false)
    expect(wrapper.props().text).toEqual('test')
    expect(wrapper.props().icon).toEqual(ICON_VARIANTS.cancel)
  })
})
