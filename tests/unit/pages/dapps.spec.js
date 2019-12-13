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
import Dapps from 'src/pages/Dapps.vue'
import { BEM_CONFIG } from 'src/config'

const localVue = createLocalVue()

localVue.use(vueBemCn, { delimiters: BEM_CONFIG })

describe('pages:Dapps.vue', () => {
  it('Should be mount', () => {
    const wrapper = shallowMount(Dapps, {
      localVue
    })

    expect(wrapper).toBeTruthy()
  })
})
