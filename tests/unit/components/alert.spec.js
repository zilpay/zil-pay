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
import Alert from 'src/components/Alert.vue'
import {
  BEM_CONFIG
} from 'src/config'

const localVue = createLocalVue()

localVue.use(vueBemCn, { delimiters: BEM_CONFIG })

describe('components:Alert', () => {
  const wrapper = shallowMount(Alert, {
    localVue
  })

  it('Should be mount', () => {
    expect(wrapper).toBeTruthy()
  })
})
