/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import vueBemCn from 'vue-bem-cn'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import Connections from 'src/pages/Connections.vue'
import { BEM_CONFIG } from 'src/config'

const localVue = createLocalVue()

localVue.use(vueBemCn, { delimiters: BEM_CONFIG })

describe('pages:Connections.vue', () => {
  it('Should be mount', () => {
    const wrapper = shallowMount(Connections, {
      localVue
    })

    expect(wrapper).toBeTruthy()
  })
})
