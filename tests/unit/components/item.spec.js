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
import Item from 'src/components/Item.vue'
import {
  BEM_CONFIG,
  ICON_VARIANTS
} from 'src/config'
import { uuid } from 'uuidv4'

const TEST_TEXT = uuid()

const localVue = createLocalVue()

localVue.use(vueBemCn, { delimiters: BEM_CONFIG })

describe('components:Item', () => {
  const wrapper = shallowMount(Item, {
    localVue,
    slots: {
      default: [TEST_TEXT]
    },
    propsData: {
      src: ICON_VARIANTS.statusSuccess,
      trash: true,
      pointer: true
    }
  })

  it('Should be mount', () => {
    expect(wrapper).toBeTruthy()
  })

  it('Should can import', () => {
    expect(Item).toBeTruthy()
  })

  it('Should be have some class', () => {
    expect(wrapper.classes()).toEqual([
      Item.name,
      `${Item.name}${BEM_CONFIG.mod}pointer`
    ])
  })

  it('Should be some props', () => {
    expect(wrapper.props().src).toEqual(ICON_VARIANTS.statusSuccess)
    expect(wrapper.props().trash).toBeTruthy()
    expect(wrapper.props().pointer).toBeTruthy()
  })

  it('Should be have some attributes', () => {
    expect(wrapper.attributes().class).toEqual(`${Item.name} ${Item.name}${BEM_CONFIG.mod}pointer`)
  })

  it('Should be img div', () => {
    expect(wrapper.element.tagName).toEqual('DIV')
  })

  it('Should can emit click event', () => {
    wrapper.vm.onClick()

    expect(wrapper.emitted().click).toBeTruthy()
  })

  it('Should can emit remove event', () => {
    wrapper.vm.onRemove()

    expect(wrapper.emitted().remove).toBeTruthy()
  })
})
