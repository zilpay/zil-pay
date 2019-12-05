import extension from 'extensionizer'
import sinonChrome from 'sinon-chrome'
import { uuid } from 'uuidv4'

let store = {}

sinonChrome.runtime.id = uuid()

global.chrome = sinonChrome

extension.runtime = global.chrome.runtime
extension.storage = {
  ...global.chrome.storage,
  local: {
    set(value, resolve) {
      store = { ...store , ...value }
      resolve(value)
    },
    get(key, resolve) {
      if (!key) {
        resolve(store)
      }

      resolve(store[key])
    }
  }
}

const { BrowserStorage, BuildObject } = require('lib/storage')

describe('lib:storage:BrowserStorage', () => {
  const storage = new BrowserStorage()
  const payload = { test: 1 }
  const key = 'testKey'

  it('should be BrowserStorage', () => {
    expect(storage).toBeTruthy()
  })

  it('should have EXT_ID prop', () => {
    expect(storage.EXT_ID).toEqual(sinonChrome.runtime.id)
  })

  it('try set value', async () => {
    const someValue = new BuildObject(key, payload)

    await storage.set(someValue)
  })

  it('try get previous value', async () => {
    const recievePaylod = await storage.get(key)

    expect(recievePaylod).toEqual(payload)
  })

  it('try get all values', async () => {
    const recievePaylod = await storage.getAll(key)

    expect(recievePaylod).toEqual({
      [key]: payload
    })
  })
})
