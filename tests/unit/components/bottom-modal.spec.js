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
import BottomModal from 'src/components/BottomModal.vue'
import { uuid } from 'uuidv4'
import { BEM_CONFIG } from 'src/config'

const localVue = createLocalVue()
const TEST_TEXT = uuid()

localVue.use(vueBemCn, { delimiters: BEM_CONFIG })

describe('components:BottomModal', () => {
  const wrapper = shallowMount(BottomModal, {
    localVue,
    slots: {
      default: [TEST_TEXT]
    }
  })

  it('Should can imported', () => {
    expect(BottomModal).toBeTruthy()
  })

  it('Should be mount', () => {
    expect(wrapper).toBeTruthy()
  })

  it('Should be have some class', () => {
    expect(wrapper.classes()).toEqual([BottomModal.name])
  })

  it('Should be have some slot content', () => {
    expect(wrapper.text()).toEqual(TEST_TEXT)
  })

})
