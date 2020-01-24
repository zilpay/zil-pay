/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import Vuex from 'vuex'
import vueBemCn from 'vue-bem-cn'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import Security from 'src/pages/settings/Security.vue'
import { BEM_CONFIG } from 'src/config'
import store from 'src/store'

const localVue = createLocalVue()

localVue.use(vueBemCn, { delimiters: BEM_CONFIG })
localVue.use(Vuex)

describe('pages:Security.vue', () => {
  it('Should be mount', () => {
    const wrapper = shallowMount(Security, {
      store,
      localVue
    })

    expect(wrapper).toBeTruthy()
  })
})
