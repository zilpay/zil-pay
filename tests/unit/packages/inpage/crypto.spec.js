import { Validator, CryptoUtils, ZilliqaUtils } from 'packages/inpage/crypto'
import {
  ERROR_MSGS,
  AccessError
} from 'packages/inpage/errors'

const TEST_CONTRACT_ADDRESS = 'zil1az5e0c6e4s4pazgahhmlca2cvgamp6kjtaxf4q'
const TEST_BASE16_ADDRESS = '0xE8A997e359AC2A1e891dBDf7fc7558623bB0eaD2'
const TEST_HEX_ADDRESS = 'e8a997e359ac2a1e891dbdf7fc7558623bb0ead2'

describe('lib:packages:inpage:crypto', () => {

  it('Should can import Validator', () => {
    expect(Validator).toBeTruthy()
  })

  it('Should can import CryptoUtils', () => {
    expect(CryptoUtils).toBeTruthy()
  })

  it('Should can import ZilliqaUtils', () => {
    expect(ZilliqaUtils).toBeTruthy()
  })


  it('Validator should have got some methods', () => {
    const validatorIntance = new Validator()

    expect(validatorIntance.isAddress).toBeTruthy()
    expect(validatorIntance.isBN).toBeTruthy()
    expect(validatorIntance.isBase58).toBeTruthy()
    expect(validatorIntance.isBech32).toBeTruthy()
    expect(validatorIntance.isLong).toBeTruthy()
  })

  it('CryptoUtils should have got some methods', () => {
    const cryptoUtilsIntance = new CryptoUtils()

    expect(cryptoUtilsIntance.decodeBase58).toBeTruthy()
    expect(cryptoUtilsIntance.fromBech32Address).toBeTruthy()
    expect(cryptoUtilsIntance.isValidChecksumAddress).toBeTruthy()
    expect(cryptoUtilsIntance.normaliseAddress).toBeTruthy()
    expect(cryptoUtilsIntance.toBech32Address).toBeTruthy()
    expect(cryptoUtilsIntance.toChecksumAddress).toBeTruthy()
    expect(cryptoUtilsIntance.toHex).toBeTruthy()
  })

  it('ZilliqaUtils should have got some methods', () => {
    const zilliqaUtilsIntance = new ZilliqaUtils()

    expect(zilliqaUtilsIntance.BN).toBeTruthy()
    expect(zilliqaUtilsIntance.Long).toBeTruthy()
    expect(zilliqaUtilsIntance.bytes).toBeTruthy()
    expect(zilliqaUtilsIntance.units).toBeTruthy()
    expect(zilliqaUtilsIntance.validation).toBeTruthy()

    expect(zilliqaUtilsIntance.validation).toEqual(new Validator())
  })

  it('CryptoUtils test methods', () => {
    const cryptoUtilsIntance = new CryptoUtils()

    try {
      cryptoUtilsIntance.decodeBase58()
    } catch (err) {
      expect(err).toEqual(new AccessError(ERROR_MSGS.DISABLE_DMETHOD))
    }

    expect(cryptoUtilsIntance.fromBech32Address(TEST_CONTRACT_ADDRESS)).toBe(TEST_BASE16_ADDRESS)
    expect(cryptoUtilsIntance.isValidChecksumAddress(TEST_CONTRACT_ADDRESS)).toBe(false)
    expect(cryptoUtilsIntance.isValidChecksumAddress(TEST_BASE16_ADDRESS)).toBe(true)
    expect(cryptoUtilsIntance.normaliseAddress(TEST_CONTRACT_ADDRESS)).toBe(TEST_BASE16_ADDRESS)
    expect(cryptoUtilsIntance.normaliseAddress(TEST_HEX_ADDRESS)).toBe(TEST_BASE16_ADDRESS)

    expect(cryptoUtilsIntance.toBech32Address(TEST_HEX_ADDRESS)).toBe(TEST_CONTRACT_ADDRESS)
    expect(cryptoUtilsIntance.toBech32Address(TEST_CONTRACT_ADDRESS)).toBe(TEST_CONTRACT_ADDRESS)
    expect(cryptoUtilsIntance.toBech32Address(TEST_BASE16_ADDRESS)).toBe(TEST_CONTRACT_ADDRESS)

    expect(cryptoUtilsIntance.toChecksumAddress(TEST_BASE16_ADDRESS)).toBe(TEST_BASE16_ADDRESS)
    expect(cryptoUtilsIntance.toChecksumAddress(TEST_HEX_ADDRESS)).toBe(TEST_BASE16_ADDRESS)
    expect(cryptoUtilsIntance.toChecksumAddress(TEST_CONTRACT_ADDRESS)).toBe(TEST_BASE16_ADDRESS)

    expect(cryptoUtilsIntance.toHex(TEST_BASE16_ADDRESS)).toBe(TEST_HEX_ADDRESS)
    expect(cryptoUtilsIntance.toHex(TEST_HEX_ADDRESS)).toBe(TEST_HEX_ADDRESS)
  })

})
