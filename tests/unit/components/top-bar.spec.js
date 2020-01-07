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
import VueRouter from 'vue-router'
import TopBar from 'src/components/TopBar.vue'
import {
  BEM_CONFIG,
  ICON_VARIANTS
} from 'src/config'

const localVue = createLocalVue()

localVue.use(VueRouter)

localVue.use(vueBemCn, { delimiters: BEM_CONFIG })

const router = new VueRouter()

describe('components:TopBar', () => {
  const wrapper = shallowMount(TopBar, {
    localVue,
    router,
    propsData: {
      left: true,
      text: 'test',
      icon: ICON_VARIANTS.cancel
    }
  })

  it('Should be vue instance', () => {
    expect(wrapper.isVueInstance()).toBeTruthy()
  })

  it('Should can import', () => {
    expect(TopBar).toBeTruthy()
  })

  it('Should be mount', () => {
    expect(wrapper).toBeTruthy()
  })

  it('Should be DIV tag', () => {
    expect(wrapper.element.tagName).toEqual('DIV')
  })

  it('Should have some class', () => {
    expect(wrapper.classes()).toEqual([
      TopBar.name
    ])
  })
})
