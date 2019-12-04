import { EncryptedStream } from 'lib/stream'
import { uuid } from 'uuidv4'

describe('lib:stream:EncryptedStream', () => {
  let streamA = null
  let streamB = null
  let synced = false

  it('should be able instantiate two unique streams', () => {
    streamA = new EncryptedStream('streamA', uuid())
    streamB = new EncryptedStream('streamB', uuid())
    streamB.onSync(() => synced = true)
    // expect(true).toBe(true)
  })

  it('should be able to sync the streams and trigger encryption', () => {
    streamA.sync('streamB', streamA.key)

    expect(streamA.synced).toBeTruthy()
    expect(streamB.synced).toBeTruthy()
    expect(synced).toBeTruthy()
  })

  it('should be able to send messages and receive them decrypted', () => {
    const payload = {
      test: 'test'
    }

    streamB.listenWith((msg) => {
      expect(msg.from).toEqual('streamA')
      expect(msg.payload).toEqual(payload)
    })

    streamA.send({ payload }, 'streamB')
  })
})
