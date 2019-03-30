import { AuthGuard } from './guard'
import errorCodes from './errors'
import Crypto from '../../../lib/crypto'


describe('Test guard control', () => {
  const crypto = new Crypto();

  it('Init guard control', () => {
    const testPassword = '12345678';
    const authGuard = new AuthGuard(testPassword);

    expect(
      authGuard.pwdHash
    ).toBe(
      crypto.hash(testPassword)
    );
  });

  it('Test wrong password', () => {
    const testPassword = '12';
    
    try {
      new AuthGuard(testPassword);
    } catch(err) {
      expect(err.message).toBe(errorCodes.WrongPassword);
    }

    try {
      new AuthGuard({});
    } catch(err) {
      expect(err.message).toBe(errorCodes.WrongParam);
    }
  });


  it('Test encrypt and decrypt', () => {
    const testPassword = '12345678';
    const authGuard = new AuthGuard(testPassword);
    const decryptString = 'i am enrypt string';
    const encryptString = authGuard.encrypt(decryptString);

    expect(decryptString).not.toBe(encryptString);
    expect(decryptString).toBe(authGuard.decrypt(encryptString));
  });

  it('Test json encrypt and decrypt', () => {
    const testPassword = '12345678';
    const authGuard = new AuthGuard(testPassword);
    const decryptObject = { key: 'i am enrypt object' };
    const encryptObject = authGuard.encryptJson(decryptObject);

    expect(decryptObject).not.toBe(encryptObject);
    expect(decryptObject).toEqual(authGuard.decryptJson(encryptObject));
  });

});