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
import vueBemCn from 'vue-bem-cn'
import Tooltip from 'vue-directive-tooltip'
import VueRouter from 'vue-router'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import Receive from 'src/pages/Receive.vue'
import { BEM_CONFIG } from 'src/config'
import store from 'src/store'

const localVue = createLocalVue()

localVue.use(VueRouter)
localVue.use(Vuex)
localVue.use(Tooltip)
localVue.use(vueBemCn, { delimiters: BEM_CONFIG })

const router = new VueRouter()

describe('pages:Receive.vue', () => {
  it('Should be mount', () => {
    const wrapper = shallowMount(Receive, {
      localVue,
      router,
      store
    })

    expect(wrapper).toBeTruthy()
  })
})
