import { CryptoGuard } from './guard'
import uuidv4 from 'uuid/v4'
import errorCodes from './errors'
import Crypto from '../../../lib/crypto'


describe('Test guard control', () => {
  const crypto = new Crypto();

  it('Init guard control', () => {
    const testPassword = uuidv4();;
    const cryptoGuard = new CryptoGuard(testPassword);

    expect(
      cryptoGuard.pwdHash
    ).toBe(
      crypto.hash(testPassword)
    );
  });

  it('Test wrong password', () => {
    const testPassword = uuidv4();
    
    try {
      new CryptoGuard(testPassword);
    } catch(err) {
      expect(err.message).toBe(errorCodes.WrongPassword);
    }

    try {
      new CryptoGuard({});
    } catch(err) {
      expect(err.message).toBe(errorCodes.WrongParam);
    }
  });


  it('Test encrypt and decrypt', () => {
    const testPassword = uuidv4();
    const cryptoGuard = new CryptoGuard(testPassword);
    const decryptString = 'i am enrypt string';
    const encryptString = cryptoGuard.encrypt(decryptString);

    expect(decryptString).not.toBe(encryptString);
    expect(decryptString).toBe(cryptoGuard.decrypt(encryptString));
  });

  it('Test json encrypt and decrypt', () => {
    const testPassword = uuidv4();
    const cryptoGuard = new CryptoGuard(testPassword);
    const decryptObject = { key: 'i am enrypt object' };
    const encryptObject = cryptoGuard.encryptJson(decryptObject);

    expect(decryptObject).not.toBe(encryptObject);
    expect(decryptObject).toEqual(cryptoGuard.decryptJson(encryptObject));
  });

});
