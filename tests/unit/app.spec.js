/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import Vuex from 'vuex'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'
import App from 'src/App.vue'
import store from 'src/store'

const localVue = createLocalVue()

localVue.use(VueRouter)

const router = new VueRouter()
localVue.use(Vuex)

describe('App.vue', () => {
  it('Should be mount', () => {
    const wrapper = shallowMount(App, {
      localVue,
      router,
      store
    })

    expect(wrapper).toBeTruthy()
  })
})
