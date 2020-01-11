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
import Verify from 'src/pages/Verify.vue'
import { BEM_CONFIG } from 'src/config'
import { generateMnemonic } from 'bip39'

const TEST_SEED = generateMnemonic(128)
const localVue = createLocalVue()

localVue.use(vueBemCn, { delimiters: BEM_CONFIG })

describe('pages:Verify.vue', () => {
  const wrapper = shallowMount(Verify, {
    localVue
  })

  it('Should can import', () => {
    expect(Verify).toBeTruthy()
  })

  it('Should be mount', () => {
    expect(wrapper).toBeTruthy()
  })

  it('Should be some data', () => {
    expect(wrapper.vm.$data.words).toBeDefined()
    expect(wrapper.vm.$data.verifyWords).toBeDefined()
    expect(wrapper.vm.$data.randomItems).toBeDefined()
  })

  it('Should can set words', () => {
    wrapper.setData({
      words: TEST_SEED
    })
    expect(wrapper.vm.$data.words).toEqual(TEST_SEED)
  })

  it('Should be have some methods', () => {
    expect(wrapper.vm.shuffle).toBeDefined()
    expect(wrapper.vm.add).toBeDefined()
    expect(wrapper.vm.rm).toBeDefined()
    expect(wrapper.vm.toHome).toBeDefined()
  })

  it('Should be have some methods', () => {
    expect(wrapper.vm.exceptionalItems).toBeDefined()
    expect(wrapper.vm.isVerify).toBeDefined()
    expect(wrapper.vm.isContinue).toBeDefined()
  })

  it('try call mounted', () => {
    const words = wrapper.vm.$data.words.split(' ')

    wrapper.vm.$data.randomItems = wrapper.vm.shuffle(words)

    expect(wrapper.vm.$data.randomItems.length).toBe(words.length)
    expect(wrapper.vm.$data.randomItems).not.toEqual(
      TEST_SEED.split(' ')
    )
  })

  it('Try decompose words', () => {
    TEST_SEED.split(' ').forEach(phrase => {
      expect(wrapper.vm.exceptionalItems).toContain(phrase)

      wrapper.vm.add(phrase)

      expect(wrapper.vm.$data.verifyWords).toContain(phrase)
      expect(wrapper.vm.exceptionalItems).not.toContain(phrase)
    })

    expect(wrapper.vm.exceptionalItems).toEqual([])
    expect(wrapper.vm.isVerify).toBeTruthy()
    expect(wrapper.vm.toHome).toBeTruthy()
  })
})
