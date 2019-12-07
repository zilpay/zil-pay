/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import extension from 'extensionizer'
import { uuid } from 'uuidv4'

jest.useFakeTimers()

const extensionID = uuid()

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

const { LocalStream } = require('lib/stream')

describe('lib:stream:LocalStream', () => {

  it('test import class LocalStream', () => {
    expect(LocalStream).toBeTruthy()
  })

  it('test import class LocalStream', () => {
    LocalStream.watch((request, response) => {
      response(true)

      expect(request).toEqual({
        data: {
          type: 'test',
          payload: 'work'
        }
      })
    })
  })

  it('should be able send request', () => {
    LocalStream.send({
      type: 'test',
      payload: 'work'
    }).then((res) => expect(res).toBeTruthy())

    jest.advanceTimersByTime(2000)
  })

})
