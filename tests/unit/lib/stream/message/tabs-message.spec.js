import extension from 'extensionizer'
import sinonChrome from 'sinon-chrome'
import { uuid } from 'uuidv4'

sinonChrome.runtime.id = uuid()

global.chrome = sinonChrome

extension.runtime = global.chrome.runtime

const { TabsMessage } = require('lib/stream/message')

describe('lib:stream:message:TabsMessage', () => {

  it('test import class TabsMessage', () => {
    expect(TabsMessage).toBeTruthy()
  })

  it('test init class TabsMessage', () => {
    const msg = {
      type: uuid(),
      payload: {
        random: uuid()
      }
    }
    const message = new TabsMessage(msg)

    expect(message).toBeTruthy()
    expect(message.send).toBeTruthy()
    expect(message.type).toEqual(msg.type)
    expect(message.payload).toEqual(msg.payload)
  })

  it('should have static method tabs', () => {
    expect(TabsMessage.tabs).toBeTruthy()
  })

})
