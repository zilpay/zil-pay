import extension from 'extensionizer'
import { LocalStream } from 'lib/stream'
import sinonChrome from 'sinon-chrome'
import { uuid } from 'uuidv4'

sinonChrome.runtime.id = uuid()

global.chrome = sinonChrome
global.window = sinonChrome
global.browser = sinonChrome

extension.runtime = global.chrome.runtime

describe('lib:stream:LocalStream', () => {

  beforeAll(() => {
    window.chrome = sinonChrome
    global.chrome = sinonChrome
  })

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
