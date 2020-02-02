/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import 'tests/polyfill.spec.js'
import vueBemCn from 'vue-bem-cn'
import Tooltip from 'vue-directive-tooltip'
import { shallowMount, createLocalVue } from '@vue/test-utils'
import About from 'src/pages/settings/About.vue'
import { BEM_CONFIG } from 'src/config'

const localVue = createLocalVue()

localVue.use(vueBemCn, { delimiters: BEM_CONFIG })
localVue.use(Tooltip)

describe('pages:About.vue', () => {
  it('Should be mount', () => {
    const wrapper = shallowMount(About, {
      localVue
    })

    expect(wrapper).toBeTruthy()
  })
})
