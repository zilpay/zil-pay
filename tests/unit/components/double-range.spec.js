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
import DoubleRange from 'src/components/DoubleRange.vue'
import { BEM_CONFIG } from 'src/config'

const localVue = createLocalVue()

localVue.use(vueBemCn, { delimiters: BEM_CONFIG })

describe('components:DoubleRange', () => {
  const wrapper = shallowMount(DoubleRange, {
    localVue,
    propsData: {
      value: [0, 100]
    }
  })

  it('Should can import', () => {
    expect(DoubleRange).toBeTruthy()
  })

  it('Should be mount', () => {
    expect(wrapper).toBeTruthy()
  })

  it('checks the props', () => {
    expect(wrapper.props().value).toEqual([0, 100])
  })

  it('Should be have some class', () => {
    expect(wrapper.classes()).toEqual([
      DoubleRange.name
    ])
  })

  it('Should be div tag', () => {
    expect(wrapper.element.tagName).toEqual('DIV')
  })

  it('Should can emit input event', () => {
    wrapper.vm.onInput(10, 0)

    expect(wrapper.emitted().input).toEqual([
      [
        [10, 100]
      ]
    ])
  })
})
