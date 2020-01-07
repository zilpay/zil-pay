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
import Title from 'src/components/Title.vue'
import {
  BEM_CONFIG,
  COLOR_VARIANTS
} from 'src/config'
import { uuid } from 'uuidv4'

const TEST_TEXT = uuid()

const localVue = createLocalVue()

localVue.use(vueBemCn, { delimiters: BEM_CONFIG })

describe('components:Title', () => {
  const wrapper = shallowMount(Title, {
    localVue,
    propsData: {
      variant: COLOR_VARIANTS.primary
    },
    slots: {
      default: [TEST_TEXT]
    }
  })

  it('Should be vue instance', () => {
    expect(wrapper.isVueInstance()).toBeTruthy()
  })

  it('Should can import', () => {
    expect(Title).toBeTruthy()
  })

  it('Should be mount', () => {
    expect(wrapper).toBeTruthy()
  })

  it('checks the props', () => {
    expect(wrapper.props().variant).toEqual(COLOR_VARIANTS.primary)
  })

  it('Should be DIV tag', () => {
    expect(wrapper.element.tagName).toEqual('DIV')
  })

  it('Should have some class', () => {
    expect(wrapper.classes()).toEqual([
      Title.name,
      `${Title.name}${BEM_CONFIG.mod}variant-${COLOR_VARIANTS.primary}`,
      `${Title.name}${BEM_CONFIG.mod}font-bold`,
      `${Title.name}${BEM_CONFIG.mod}size-lg`
    ])
  })

  it('Should be have childran text', () => {
    expect(wrapper.text()).toEqual(TEST_TEXT)
  })
})
