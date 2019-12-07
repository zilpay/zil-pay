/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { shallowMount, createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'
import App from 'src/App.vue'

const localVue = createLocalVue()

localVue.use(VueRouter)

const router = new VueRouter()

describe('src:App.vue', () => {
  it('Should be mount', () => {
    const wrapper = shallowMount(App, {
      localVue,
      router
    })
    expect(wrapper).toBeTruthy()
  })
})
