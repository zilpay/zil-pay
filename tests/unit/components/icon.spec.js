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
import Icon from 'src/components/Icon.vue'
import {
  BEM_CONFIG,
  ICON_TYPE,
  ICON_VARIANTS
} from 'src/config'

const localVue = createLocalVue()

localVue.use(vueBemCn, { delimiters: BEM_CONFIG })

describe('components:Icon', () => {
  const wrapper = shallowMount(Icon, {
    localVue,
    propsData: {
      icon: ICON_VARIANTS.zilliqaLogo,
      type: ICON_TYPE.svg,
      height: 300,
      width: 10,
      pointer: true
    }
  })

  it('Should can import', () => {
    expect(Icon).toBeTruthy()
  })

  it('Should be mount', () => {
    expect(wrapper).toBeTruthy()
  })

  it('Should be vue instance', () => {
    expect(wrapper.isVueInstance()).toBeTruthy()
  })

  it('checks the props', () => {
    expect(wrapper.props().icon).toEqual(ICON_VARIANTS.zilliqaLogo)
    expect(wrapper.props().type).toEqual(ICON_TYPE.svg)
    expect(wrapper.props().height).toBe(300)
    expect(wrapper.props().width).toBe(10)
    expect(wrapper.props().pointer).toEqual(true)
  })

  it('Should be have some class', () => {
    expect(wrapper.classes()).toEqual([
      Icon.name,
      `${Icon.name}${BEM_CONFIG.mod}pointer`
    ])
  })

  it('Should be have some attributes', () => {
    expect(wrapper.attributes()).toEqual({
      src: `/icons/${ICON_VARIANTS.zilliqaLogo}.${ICON_TYPE.svg}`,
      height: '300',
      width: '10',
      class: `${Icon.name} ${Icon.name}${BEM_CONFIG.mod}pointer`
    })
  })

  it('Should be img tag', () => {
    expect(wrapper.element.tagName).toEqual('IMG')
  })
})
