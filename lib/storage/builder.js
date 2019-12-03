/**
 * Through this class can build payload for write to browser Storage..
 */
export class BuildObject {

  constructor(key, value) {
    if (typeof key !== 'string') {
      throw new Error('key most be string')
    }

    this[key] = value
  }
}
