/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { TypeChecker } from 'lib/type'
import { MUST_BE_STRING } from 'lib/errors/annotations'

/**
 * Through this class can build payload for write to browser Storage.
 * @param {String} key - key object.
 * @param {any} value - any object or array.
 * @example
 * import { BuildObject, BrowserStorage } from 'lib/storage'
 * new BrowserStorage().set([
 *  new BuildObject('key', 'any payload or object or array')
 * ])
 */
export class BuildObject {

  constructor(key, value) {
    if (!new TypeChecker(key).isString) {
      throw new TypeError(`key ${MUST_BE_STRING}`)
    }

    this[key] = value
  }
}
