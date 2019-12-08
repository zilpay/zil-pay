/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { TabStream } from 'lib/stream'
import { uuid } from 'uuidv4'

describe('lib:stream:TabStream', () => {
  let streamA = null
  let streamB = null

  it('should be able instantiate two unique streams', () => {
    streamA = new TabStream('streamA', uuid())
    streamB = new TabStream('streamB', uuid())

    expect(streamA).toBeTruthy()
    expect(streamB).toBeTruthy()
  })

  it('streamB should be able to send messages and receive ', () => {
    const payload = {
      streamA: 'testa data from streamA',
    }

    const stream = streamB.listen().subscribe(msg => {
      expect(msg.from).toEqual('streamA')
      expect(msg.payload).toEqual(payload)

      stream.unsubscribe()
    })

    streamA.send({ payload }, 'streamB')
  })

  it('streamA should be able to send messages and receive', () => {
    const payload = {
      streamB: 'testa data from streamB',
    }

    const stream = streamA.listen().subscribe(msg => {
      expect(msg.from).toEqual('streamB')
      expect(msg.payload).toEqual(payload)

      stream.unsubscribe()
    })

    streamB.send({ payload }, 'streamA')
  })
})
