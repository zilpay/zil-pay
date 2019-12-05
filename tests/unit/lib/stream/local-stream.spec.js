import sinonChrome from 'sinon-chrome'
import { uuid } from 'uuidv4'

sinonChrome.runtime.id = uuid()

global.chrome = sinonChrome

const { LocalStream } = require('lib/stream')

describe('lib:stream:LocalStream', () => {

  it('test import class LocalStream', () => {
    expect(LocalStream).toBeTruthy()
  })

  it('should be able send request', () => {
    LocalStream.send({
      type: 'test',
      payload: 'work'
    }).then((res) => console.log('work', res))
  })

})
