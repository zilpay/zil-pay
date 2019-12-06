require('packages/inpage')

const TEST_ADDRESS_BECH32 = 'zil1fmefrn4ajk45yv0t22czehcwyv02k4j6ew07pj'
const TESTE_ADDRESS_BASE16 = '0x4ef291cEbD95ab4231eB52b02Cdf0E231Eab565a'


describe('lib:packages:inpage', () => {

  it('should injected proxy object', () => {
    expect(window.zilPay).toBeTruthy()
  })

  it('should have provider object', () => {
    expect(window.zilPay.provider).toBeTruthy()
  })

  it('should have wallet object', () => {
    expect(window.zilPay.wallet).toBeTruthy()
  })

  it('should have blockchain object', () => {
    expect(window.zilPay.blockchain).toBeTruthy()
  })

  it('should have contracts object', () => {
    expect(window.zilPay.contracts).toBeTruthy()
  })

  it('should have transactions object', () => {
    expect(window.zilPay.transactions).toBeTruthy()
  })

  it('should have utils object', () => {
    expect(window.zilPay.utils).toBeTruthy()
  })

  it('should have crypto object', () => {
    expect(window.zilPay.crypto).toBeTruthy()
  })

  it('try decode bech32 address', () => {
    const base16 = window
      .zilPay
      .crypto
      .fromBech32Address(TEST_ADDRESS_BECH32)

    expect(base16).toEqual(TESTE_ADDRESS_BASE16)
  })

  it('try encode base16 to bech32 address', () => {
    const base16 = window
      .zilPay
      .crypto
      .toBech32Address(TESTE_ADDRESS_BASE16)

    expect(base16).toEqual(TEST_ADDRESS_BECH32)
  })
})
