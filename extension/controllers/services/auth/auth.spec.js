import { Auth } from './index'
import uuidv4 from 'uuid/v4'
import { BrowserStorage, BuildObject } from '../../../../lib/storage'
// import ZilliqaConfig from '../../../config/zil'
import fields from '../../../../config/fields'

const browserStorage = new BrowserStorage();
const decryptSeed = 'banana blind business arrest escape blame stadium display border flower daughter story';
const password = uuidv4();

describe('Test authentication guard', () => {
  var authControl;

  test('init auth control', () => {
    authControl = new Auth();

    expect(authControl.isEnable).toBe(false);
    expect(authControl.isReady).toBe(false);
    expect(authControl.encryptSeed).toBeNull();
    expect(authControl.encryptImported).toBeNull();
  });

  test('create encrypted wallet by password', async () => {
    const wallet = Auth.encryptWallet(
      decryptSeed, [], password
    );

    await browserStorage.set([
      new BuildObject(fields.VAULT, wallet.encryptSeed),
      new BuildObject(fields.VAULT_IMPORTED, wallet.encryptImported)
    ]);
  });

  test('Auth control vaultSync', async () => {
    authControl = new Auth();

    await authControl.vaultSync();

    expect(authControl.encryptSeed).not.toBeNull();
    expect(authControl.encryptImported).not.toBeNull();
    expect(authControl.isReady).toBe(true);
    expect(authControl.isEnable).toBe(false);
  });

});
