import extension from 'extensionizer'
import { uuid } from 'uuidv4'

const extensionID = uuid()

let store = {}

extension.runtime = {
  id: extensionID,
  sendMessage(msg, cb) {
    this.onMessage.trigger(msg, cb)
  },
  onMessage:{
    messageQueue:[],
    trigger(data, cb) {
      this.messageQueue.push({
        data,
        cb
      })
    },
    addListener(cb) {
      setInterval(() => {
        if(this.messageQueue.length){
          let message = this.messageQueue.pop()
          cb(
            {
              data: message.data
            },
            {
              id: extensionID
            },
            message.cb
          )
        }
      }, 1000)
    }
  }
}
extension.storage = {
  local: {
    set(value, resolve) {
      Object
        .keys(value)
        .forEach(key => store[key] = {
          ...store[key],
          ...value[key]
        })
      resolve()
    },
    get(key, resolve) {
      if (!key) {
        resolve(store)
      }

      resolve(store[key])
    },
    remove(key, resolve) {
      delete store[key]

      resolve()
    },
    clear(resolve) {
      store = {}
      resolve()
    },
    onChanged: {
      removeListener() {},
      addListener(cb) {
        cb(true)
      }
    }
  }
}
