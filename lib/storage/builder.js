/**
 * Through this class can build payload for write to browser Storage.
 * @param {String} key - key object.
 * @param {any} value - any object or array.
 * @example
 * import { BuildObject, BrowserStorage } from 'lib/storage'
 * new BrowserStorage().set([
 *  new BuildObject('key', 'any payload or object or array')
 * ])
 * 
 */
export class BuildObject {

  constructor(key, value) {
    if (typeof key !== 'string') {
      throw new Error('key most be string')
    }

    this[key] = value
  }
}
