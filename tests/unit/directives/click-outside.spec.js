/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { createLocalVue } from '@vue/test-utils'
import OutSideClick from 'src/directives/click-outside'

const localVue = createLocalVue()

localVue.directive('click-outside', OutSideClick)

describe('components:Button', () => {

  it('Should can imported', () => {
    expect(OutSideClick).toBeTruthy()
  })

  it('Should have function bind', () => {
    expect(OutSideClick.bind).toBeTruthy()
  })

  it('Should have function bind', () => {
    expect(OutSideClick.unbind).toBeTruthy()
  })
})
