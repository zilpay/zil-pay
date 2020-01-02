/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import vueBemCn from 'vue-bem-cn'
import VueRouter from 'vue-router'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import Receive from 'src/pages/Receive.vue'
import { BEM_CONFIG } from 'src/config'

const localVue = createLocalVue()

localVue.use(VueRouter)

localVue.use(vueBemCn, { delimiters: BEM_CONFIG })

const router = new VueRouter()

describe('pages:Receive.vue', () => {
  it('Should be mount', () => {
    const wrapper = shallowMount(Receive, {
      localVue,
      router
    })

    expect(wrapper).toBeTruthy()
  })
})
