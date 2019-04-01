import { Auth } from './index'
import { CryptoGuard } from '../crypto/guard'

const jestTimeOut = 16000;
const password = '123456';
const privateKey = '2301b67bf6fdfd20d328249585a6626f271fcf0c22cbfc66834203fbb78b1d06';
const decryptSeed = 'thumb face object present purse corn throw box anxiety seminar excess warfare';
const decryptImported = [
  { privateKey, index: 0 }
];


describe('Test authentication control', () => {

  it('Test init Auth', () => {
    const auth = new Auth();

    expect(auth.isEnable).toBe(false);
    expect(auth.isReady).toBe(false);
  }, jestTimeOut);

  it('Test setPassword method', () => {
    const auth = new Auth();
    const guard = new CryptoGuard(password);
    
    auth.encryptSeed = guard.encrypt(decryptSeed);
    auth.encryptImported = guard.encryptJson(decryptImported);
    
    const wallet = auth.setPassword(password);

    expect(wallet).toEqual({ decryptSeed, decryptImported });
    expect(auth.isEnable).toBe(true);
    expect(auth.isReady).toBe(true);
  }, jestTimeOut);

  it('Test getWallet method', () => {
    const auth = new Auth();
    const guard = new CryptoGuard(password);
    
    auth.encryptSeed = guard.encrypt(decryptSeed);
    auth.encryptImported = guard.encryptJson(decryptImported);
    auth.setPassword(password);

    const wallet = auth.getWallet();

    expect(wallet).toEqual({ decryptSeed, decryptImported });
  }, jestTimeOut);

  it('Test vaultSync method', async () => {
    const auth = new Auth();
    const guard = new CryptoGuard(password);

    const encryptSeed = guard.encrypt(decryptSeed);
    const encryptImported = guard.encryptJson(decryptImported);

    auth._storage.get = () => {
      const encryptWallet = Auth.encryptWallet(decryptSeed, decryptImported, password);
      return {
        importedvault: encryptWallet.encryptImported,
        vault: encryptWallet.encryptSeed
      };
    };
    
    const encryptVault = await auth.vaultSync();
    
    expect(encryptVault).toEqual({ encryptSeed, encryptImported });
    expect(auth.isReady).toBe(true);
  }, jestTimeOut);

});