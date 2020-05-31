/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import 'tests/polyfill.spec.js'
import Vuex from 'vuex'
import Tooltip from 'vue-directive-tooltip'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import vueBemCn from 'vue-bem-cn'
import AccountCard from 'src/components/AccountCard.vue'
import {
  BEM_CONFIG,
  ICON_VARIANTS
} from 'src/config'
import store from 'src/store'

const TEST_ACCOUNT = {
  address: '0x119929d8c388DE3650Ea1B3DC7b9Fe0ceEFE862F',
  balance: '463851500000000',
  index: 0,
  name: 'Account 0'
}
const localVue = createLocalVue()

localVue.use(vueBemCn, { delimiters: BEM_CONFIG })
localVue.use(Vuex)
localVue.use(Tooltip)

describe('components:AccountCard', () => {
  const wrapper = shallowMount(AccountCard, {
    localVue,
    store,
    propsData: {
      account: TEST_ACCOUNT,
      selected: true,
      trash: true
    }
  })

  it('Should be mount', () => {
    expect(wrapper).toBeTruthy()
  })

  it('Should can import', () => {
    expect(AccountCard).toBeTruthy()
  })

  it('Should be have some class', () => {
    expect(wrapper.classes()).toEqual([AccountCard.name])
  })

  it('Should be some props', () => {
    expect(wrapper.props().account).toEqual(TEST_ACCOUNT)
    expect(wrapper.props().selected).toEqual(true)
    expect(wrapper.props().trash).toEqual(true)
  })

  it('Should be have some attributes', () => {
    expect(wrapper.attributes().class).toEqual(AccountCard.name)
    expect(wrapper.attributes().style).toEqual('background-color: rgb(150, 134, 47);')
  })

  it('Should be have some computed prop', () => {
    expect(wrapper.vm.color).toEqual({
      backgroundColor: 'rgb(150, 134, 47)'
    })
    expect(wrapper.vm.watermarkIcon).toBe(ICON_VARIANTS.zilliqaWatermark)
  })

  it('Should be img div', () => {
    expect(wrapper.element.tagName).toEqual('DIV')
  })
})
