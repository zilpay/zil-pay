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
import GasControl from 'src/components/GasControl.vue'
import { BEM_CONFIG } from 'src/config'
import { DEFAULT_GAS_FEE } from 'config/zilliqa'

const localVue = createLocalVue()

localVue.use(vueBemCn, { delimiters: BEM_CONFIG })

const TEST_VALUE = {
  gasPrice: 1500,
  gasLimit: 2
}

describe('components:GasControl', () => {
  const wrapper = shallowMount(GasControl, {
    localVue,
    propsData: {
      value: TEST_VALUE,
      DEFAULT: DEFAULT_GAS_FEE
    }
  })

  it('Should can import', () => {
    expect(GasControl).toBeTruthy()
  })

  it('Should be mount', () => {
    expect(wrapper).toBeTruthy()
  })

  it('Should have some props', () => {
    expect(wrapper.props().value).toEqual(TEST_VALUE)
    expect(wrapper.props().DEFAULT).toEqual(DEFAULT_GAS_FEE)
  })

  it('Should be have some class', () => {
    expect(wrapper.classes()).toEqual([
      GasControl.name
    ])
  })

  it('Should be div tag', () => {
    expect(wrapper.element.tagName).toEqual('CONTAINER-STUB')
  })

  it('Should can calculated gas fee', () => {
    expect(wrapper.vm.fee).toBe('0.003')
  })

  it('Should have some methods', () => {
    expect(wrapper.vm.onFactor).toBeDefined()
    expect(wrapper.vm.onGasPrice).toBeDefined()
    expect(wrapper.vm.onGasLimit).toBeDefined()

    expect(typeof wrapper.vm.onFactor).toBe('function')
    expect(typeof wrapper.vm.onGasPrice).toBe('function')
    expect(typeof wrapper.vm.onGasLimit).toBe('function')
  })
})
