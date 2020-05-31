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
import Separator from 'src/components/Separator.vue'
import {
  BEM_CONFIG
} from 'src/config'

const localVue = createLocalVue()

localVue.use(vueBemCn, { delimiters: BEM_CONFIG })

describe('components:Separator', () => {
  const wrapper = shallowMount(Separator, {
    localVue
  })

  it('Should can import', () => {
    expect(Separator).toBeTruthy()
  })

  it('Should be mount', () => {
    expect(wrapper).toBeTruthy()
  })

  it('Should be DIV tag', () => {
    expect(wrapper.element.tagName).toEqual('DIV')
  })

  it('Should have some class', () => {
    expect(wrapper.classes()).toEqual([
      Separator.name
    ])
  })
})
