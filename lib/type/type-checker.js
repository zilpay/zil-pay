/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */

export const JS_TYPES = {
  string: 'string',
  number: 'number',
  object: 'object',
  boolean: 'boolean',
  undefined: 'undefined',
  function: 'function',
  symbol: 'symbol'
}

/**
 * Method for testing type.
 * @param {String, JS_TYPES} type - JavaScript types.
 * @param  {...any} args - arguments for check type.
 */
export function checkType(type, ...args) {
  if (!(type in JS_TYPES)) {
    throw new Error('Incorrect type!')
  }

  for (let index = 0; index < args.length; index++) {
    const arg = args[index]

    if (typeof arg !== type) {
      return false
    }
  }

  return true
}

/**
 * Universal type checker that would easyly checking types.
 */
export class TypeChecker {

  /**
   * Testing on undefined, if at least one return true.
   * @example
   * import { TypeChecker } from 'lib/type'
   * new TypeChecker(undefined).isUndefined // return true.
   */
  get isUndefined() {
    for (let index = 0; index < this._args.length; index++) {
      const arg = this._args[index]

      if (typeof arg === JS_TYPES.undefined) {
        return true
      }
    }

    return false
  }

  /**
   * Testing on integer number.
   * @example
   * import { TypeChecker } from 'lib/type'
   * new TypeChecker(1).isInt // return true.
   */
  get isInt() {
    for (let index = 0; index < this._args.length; index++) {
      const arg = this._args[index]

      if ((typeof arg !== JS_TYPES.number) || arg % 1 !== 0) {
        return false
      }
    }

    return true
  }

  /**
   * Testing on float number.
   * @example
   * import { TypeChecker } from 'lib/type'
   * new TypeChecker(0.3).isFloat // return true.
   */
  get isFloat() {
    for (let index = 0; index < this._args.length; index++) {
      const arg = this._args[index]

      if ((typeof arg !== JS_TYPES.number) || !Math.abs(arg % 1) > 0) {
        return false
      }
    }

    return true
  }

  /**
   * Testing on array.
   * @example
   * import { TypeChecker } from 'lib/type'
   * new TypeChecker([1, '']).isArray // return true.
   */
  get isArray() {
    for (let index = 0; index < this._args.length; index++) {
      const arg = this._args[index]

      if (!Array.isArray(arg)) {
        return false
      }
    }

    return true
  }

  /**
   * TTesting on string value
   * @example
   * import { TypeChecker } from 'lib/type'
   * new TypeChecker('example').isString // return true.
   */
  get isString() {
    return checkType(JS_TYPES.string, ...this._args)
  }

  /**
   * Testing on object value.
   * @example
   * import { TypeChecker } from 'lib/type'
   * new TypeChecker(new Object()).isString // return true.
   */
  get isObject() {
    return checkType(JS_TYPES.object, ...this._args)
  }

  /**
   * Testing on boolean value.
   * @example
   * import { TypeChecker } from 'lib/type'
   * new TypeChecker(false).isBoolean // return true.
   */
  get isBoolean() {
    return checkType(JS_TYPES.boolean, ...this._args)
  }

  /**
   * Testing on function type.
   * @example
   * import { TypeChecker } from 'lib/type'
   * new TypeChecker(() => null).isFunction // return true.
   */
  get isFunction() {
    return checkType(JS_TYPES.function, ...this._args)
  }

  /**
   * Testing on symbol type.
   * @example
   * import { TypeChecker } from 'lib/type'
   * new TypeChecker(() => null).isSymbol // return true.
   */
  get isSymbol() {
    return checkType(JS_TYPES.symbol, ...this._args)
  }

  constructor(...args) {
    this._args = args
  }

}
