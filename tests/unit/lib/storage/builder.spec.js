/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { BuildObject } from 'lib/storage'

describe('lib:storage:BuildObject', () => {

  it('should be BuildObject', () => {
    expect(new BuildObject('test', 'value')).toBeTruthy()
  })

  it('has key and value', () => {
    expect(new BuildObject('test', 'value')).toEqual({
      test: 'value',
    })
  })
})
