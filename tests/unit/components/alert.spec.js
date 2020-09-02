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
import { v4 as uuid } from 'uuid'

const TEST_TEXT = uuid()
const localVue = createLocalVue()

localVue.use(vueBemCn, { delimiters: BEM_CONFIG })

describe('components:Alert', () => {
  const wrapper = shallowMount(Alert, {
    localVue,
    slots: {
      default: [TEST_TEXT]
    }
  })

  it('Should be mount', () => {
    expect(wrapper).toBeTruthy()
  })

  it('Should can import', () => {
    expect(Alert).toBeTruthy()
  })

  it('Should be have some class', () => {
    expect(wrapper.classes()[0]).toEqual(Alert.name)
  })

  it('Should be have childran text', () => {
    expect(wrapper.text()).toEqual(TEST_TEXT)
  })
})
