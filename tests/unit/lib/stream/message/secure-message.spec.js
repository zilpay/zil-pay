import extension from 'extensionizer'
import sinonChrome from 'sinon-chrome'
import { uuid } from 'uuidv4'

sinonChrome.runtime.id = uuid()

global.chrome = sinonChrome

extension.runtime = global.chrome.runtime

const { SecureMessage } = require('lib/stream/message')

describe('lib:stream:message:SecureMessage', () => {

  it('test import class SecureMessage', () => {
    expect(SecureMessage).toBeTruthy()
  })

  it('test init class SecureMessage', () => {
    const msg = {
      type: uuid(),
      payload: {
        random: uuid()
      }
    }
    const message = new SecureMessage(msg)

    expect(message).toBeTruthy()
    expect(message.send).toBeTruthy()
    expect(message.type).toEqual(msg.type)
    expect(message.payload).toEqual(msg.payload)
  })

})
