/* eslint-disable no-return-assign */
/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import extension from 'extensionizer'
import { v4 as uuid } from 'uuid'

const extensionID = uuid()
const { localStorage } = global.window

let messageQueue = []

extension.runtime = {
  id: extensionID,
  sendMessage(msg, cb) {
    this.onMessage.trigger(msg, cb)
  },
  onMessage: {
    trigger(data, cb) {
      messageQueue.push({
        data,
        cb
      })
    },
    addListener(cb) {
      setInterval(() => {
        if (messageQueue.length) {
          let message = messageQueue.pop()

          cb(
            message.data,
            {
              id: extensionID,
            },
            message.cb
          )
        }
      }, 1)
    },
  },
}
extension.tabs = {
  query: (_, resolve) => resolve()
}
extension.extension = {
  getURL: () => null
}
extension.storage = {
  local: {
    set(value, resolve) {
      for (const key in value) {
        localStorage.setItem(key, JSON.stringify(value[key]))
      }

      resolve()
    },
    get(inputKeys, resolve) {
      let data = {}

      if (!inputKeys) {
        let keys = Object.keys(localStorage)

        keys.forEach((key) => {
          try {
            data[key] = JSON.parse(localStorage.getItem(key))
          } catch (err) {
            data[key] = localStorage.getItem(key)
          }
        })

        return resolve(data)
      }

      if (Array.isArray(inputKeys)) {
        inputKeys.forEach(key => {
          try {
            data[key] = JSON.parse(localStorage.getItem(key))
          } catch (err) {
            data[key] = localStorage.getItem(key)
          }
        })
      } else if (typeof inputKeys === 'string') {
        data[inputKeys] = JSON.parse(localStorage.getItem(inputKeys))
      }

      resolve(data)
    },
    remove(key, resolve) {
      localStorage.removeItem(key)

      resolve()
    },
    clear(resolve) {
      localStorage.clear()

      resolve()
    }
  },
  onChanged: {
    removeListener() {},
    addListener(cb) {
      cb()
    }
  }
}
extension.webRequest = {
  onErrorOccurred: {
    removeListener: () => null,
    addListener: () => null
  }
}
extension.browserAction = {
  setBadgeText() {
  }
}
