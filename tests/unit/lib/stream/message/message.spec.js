import extension from 'extensionizer'
import sinonChrome from 'sinon-chrome'
import { uuid } from 'uuidv4'

sinonChrome.runtime.id = uuid()

global.chrome = sinonChrome

extension.runtime = global.chrome.runtime

const { Message } = require('lib/stream/message')

describe('lib:stream:message:Message', () => {

  it('test import class Message', () => {
    expect(Message).toBeTruthy()
  })

  it('test init class Message', () => {
    const msg = {
      type: uuid(),
      payload: {
        random: uuid()
      }
    }
    const message = new Message(msg)

    expect(message).toBeTruthy()
    expect(message.send).toBeTruthy()
    expect(message.type).toEqual(msg.type)
    expect(message.payload).toEqual(msg.payload)
  })

  it('should have static method signal', () => {
    expect(Message.signal).toBeTruthy()
  })

})
