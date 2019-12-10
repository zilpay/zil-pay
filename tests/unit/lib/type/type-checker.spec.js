/* eslint-disable no-new-object */
/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { TypeChecker } from 'lib/type'

const { Symbol } = global

describe('lib:type:TypeChecker', () => {

  it('isUndefined should be true with one param', () => {
    expect(new TypeChecker(undefined).isUndefined).toBeTruthy()
  })

  it('isUndefined should be true with more param', () => {
    const test = new TypeChecker(1, 3, '', Symbol('test'), undefined)

    expect(test.isUndefined).toBeTruthy()
  })

  it('isUndefined should be false with more param', () => {
    const test = new TypeChecker(1, 3, '')

    expect(test.isUndefined).toBeFalsy()
  })

  it('isInt should be true with one param', () => {
    const test = new TypeChecker(1)

    expect(test.isInt).toBeTruthy()
  })

  it('isInt should be true with more param', () => {
    const test = new TypeChecker(1, 3, 0, -3)

    expect(test.isInt).toBeTruthy()
  })

  it('isInt should be false with one param', () => {
    const test = new TypeChecker(1.33)

    expect(test.isInt).toBeFalsy()
  })

  it('isInt should be false with more param', () => {
    const test = new TypeChecker(1.33, 3, 0.1, -3.333)

    expect(test.isInt).toBeFalsy()
  })

  it('isFloat should be true with one param', () => {
    const test = new TypeChecker(1.1)

    expect(test.isFloat).toBeTruthy()
  })

  it('isFloat should be true with more param', () => {
    const test = new TypeChecker(0.2, 1.3, 0.003, -3.311)

    expect(test.isFloat).toBeTruthy()
  })

  it('isFloat should be false with one param', () => {
    const test = new TypeChecker(90)

    expect(test.isFloat).toBeFalsy()
  })

  it('isFloat should be false with more param', () => {
    const test = new TypeChecker(1, 3, 0.3, 0.003, 1111)

    expect(test.isFloat).toBeFalsy()
  })

  it('isString should be true with one param', () => {
    const test = new TypeChecker('test')

    expect(test.isString).toBeTruthy()
  })

  it('isString should be true with more param', () => {
    const test = new TypeChecker('', 'test', '0')

    expect(test.isString).toBeTruthy()
  })

  it('isString should be false with one param', () => {
    const test = new TypeChecker(null)

    expect(test.isString).toBeFalsy()
  })

  it('isString should be false with more param', () => {
    const test = new TypeChecker(null, 1, 3, '')

    expect(test.isString).toBeFalsy()
  })

  it('isObject should be true with one param', () => {
    const test = new TypeChecker({})

    expect(test.isObject).toBeTruthy()
  })

  it('isObject should be true with more param', () => {
    const test = new TypeChecker({}, { test: 1 }, new Date())

    expect(test.isObject).toBeTruthy()
  })

  it('isObject should be false with one param', () => {
    const test = new TypeChecker('')

    expect(test.isObject).toBeFalsy()
  })

  it('isObject should be false with more param', () => {
    const test = new TypeChecker(undefined, 1, '', 'test')

    expect(test.isObject).toBeFalsy()
  })

  it('isArray should be true with one param', () => {
    const test = new TypeChecker([])

    expect(test.isArray).toBeTruthy()
  })

  it('isArray should be true with more param', () => {
    const test = new TypeChecker([], ['test', 'test2'], [1, 2, 3])

    expect(test.isArray).toBeTruthy()
  })

  it('isArray should be false with one param', () => {
    const test = new TypeChecker(null)

    expect(test.isArray).toBeFalsy()
  })

  it('isArray should be false with more param', () => {
    const test = new TypeChecker(null, new Object(), 3, '')

    expect(test.isArray).toBeFalsy()
  })

  it('isBoolean should be true with one param', () => {
    const test = new TypeChecker(true)

    expect(test.isBoolean).toBeTruthy()
  })

  it('isBoolean should be true with more param', () => {
    const test = new TypeChecker(false, false, false)

    expect(test.isBoolean).toBeTruthy()
  })

  it('isBoolean should be false with one param', () => {
    const test = new TypeChecker('')

    expect(test.isBoolean).toBeFalsy()
  })

  it('isBoolean should be false with more param', () => {
    const test = new TypeChecker(undefined, 1, '', 'test', true)

    expect(test.isBoolean).toBeFalsy()
  })

  it('isFunction should be true with one param', () => {
    const test = new TypeChecker(() => null)

    expect(test.isFunction).toBeTruthy()
  })

  it('isFunction should be true with more param', () => {
    const test = new TypeChecker(function() {}, () => null)

    expect(test.isFunction).toBeTruthy()
  })

  it('isFunction should be false with one param', () => {
    const test = new TypeChecker(null)

    expect(test.isFunction).toBeFalsy()
  })

  it('isFunction should be false with more param', () => {
    const test = new TypeChecker(null, new Object(), 3, '')

    expect(test.isFunction).toBeFalsy()
  })

  it('isSymbol should be true with one param', () => {
    const test = new TypeChecker(Symbol())

    expect(test.isSymbol).toBeTruthy()
  })

  it('isSymbol should be true with more param', () => {
    const test = new TypeChecker(Symbol(), Symbol(2), Symbol('a'))

    expect(test.isSymbol).toBeTruthy()
  })

  it('isSymbol should be false with one param', () => {
    const test = new TypeChecker('')

    expect(test.isSymbol).toBeFalsy()
  })

  it('isSymbol should be false with more param', () => {
    const test = new TypeChecker(undefined, 1, '', 'test', true)

    expect(test.isSymbol).toBeFalsy()
  })
})
