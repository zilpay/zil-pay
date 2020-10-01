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

let store = {}
let storeChanged = {}
let hasBeenChanged = false
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
extension.storage = {
  local: {
    set(value, resolve) {
      storeChanged = {
        newValue: value,
        oldValue: ''
      }

      for (const key in value) {
        storeChanged.oldValue = store[key]
      }

      store = JSON.parse(JSON.stringify(Object.assign(store, value)))

      resolve()

      hasBeenChanged = true
    },
    get(inputKeys, resolve) {
      if (!inputKeys) {
        resolve(store)
      }

      let data = {}

      try {
        inputKeys.forEach(key => {
          data[key] = store[key]
        })
      } catch (err) {
        data[inputKeys] = store[inputKeys]
      }

      resolve(data)
    },
    remove(key, resolve) {
      storeChanged = {
        newValue: null,
        oldValue: store[key]
      }

      delete store[key]

      resolve()

      hasBeenChanged = true
    },
    clear(resolve) {
      store = {}

      resolve()

      hasBeenChanged = true
    }
  },
  onChanged: {
    removeListener() {},
    addListener(cb) {
      global.setInterval(() => {
        if (hasBeenChanged) {
          cb(storeChanged)
        }

        hasBeenChanged = false
      }, 100)
    }
  }
}
extension.browserAction = {
  setBadgeText() {
  }
}
