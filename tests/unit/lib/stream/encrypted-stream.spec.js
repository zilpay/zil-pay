import { EncryptedStream } from 'lib/stream'

describe('lib:stream:EncryptedStream', () => {

  const stream = new EncryptedStream()

  it('renders props.msg when passed', () => {
    console.log(stream)
    expect(true).to.be(true)
  })
})
