import { toChecksumAddress } from '@zilliqa-js/crypto';
import { AccountControl } from './create'
import { AccountImporter } from './import'
import { AccountExporter } from './export'
import uuidv4 from 'uuid/v4'
import errorsCode from './errors'
import fields from '../../../config/fields'


const decryptSeed = 'banana blind business arrest escape blame stadium display border flower daughter story';
const privateKey = '2301b67bf6fdfd20d328249585a6626f271fcf0c22cbfc66834203fbb78b1d06';
const password = uuidv4();

describe('Test Account control', () => {
  var accountControl;

  test('init Account control', () => {
    accountControl = new AccountControl();
  });

  test('Account control initWallet', async () => {
    await accountControl.auth.setPassword(password);

    const account = await accountControl.initWallet(decryptSeed);

    expect(account).toEqual({
      index: 0,
      publicKey: '03d2298c106651c9a2070df250342d90e717a68660fab34082d212d5d3a7133f88',
      address: toChecksumAddress('a359105c9c8fda34278186c564ca2d3664e86821'),
      privateKey: '2295606db2e8a1baa70e08a169155f94eb3e908ac205013de74dd35b999b96b3',
      balance: account.balance
    });
  });

  test('Account control newAccountBySeed', async () => {
    await accountControl.auth.setPassword(password);

    const wallet = await accountControl.newAccountBySeed();

    expect(wallet).toEqual(global.storage[fields.WALLET]);
    expect(wallet.selectedAddress).toBe(1);
    expect(wallet.identities[0].address).toBe(toChecksumAddress('a359105c9c8fda34278186c564ca2d3664e86821'));
    expect(wallet.identities[1].address).toBe(toChecksumAddress('9ed19dd4c5d011eb458bbfda6d06d2db7ef9244f'));
  });

  test('Account control walletUpdate', async () => {
    const walletForChange = {
      selectedAddress: 0,
      identities: [{
        address: toChecksumAddress('a359105c9c8fda34278186c564ca2d3664e86821'),
        balance: 0,
        index: 0 
      }]
    };

    await accountControl.walletUpdate(walletForChange);

    expect(walletForChange).toEqual(global.storage[fields.WALLET]);
  });


  test('init Account importer control', () => {
    new AccountImporter(accountControl);
  });

  test('Account importer control initWallet', () => {
    const accountImporter = new AccountImporter(accountControl);

    try {
      accountImporter.initWallet();
    } catch(err) {
      expect(err.message).toBe(errorsCode.DisableMethod);
    }
  });

  test('Account importer control newAccountBySeed', () => {
    const accountImporter = new AccountImporter(accountControl);

    try {
      accountImporter.newAccountBySeed();
    } catch(err) {
      expect(err.message).toBe(errorsCode.DisableMethod);
    }
  });

  test('Account importer control importAccountByPrivateKey', async () => {
    const accountImporter = new AccountImporter(accountControl);
    const wallet = await accountImporter.importAccountByPrivateKey(privateKey);
    expect(wallet).toEqual(global.storage[fields.WALLET]);
    expect(wallet.selectedAddress).toBe(1);
    expect(wallet.identities[1].index).toBe(1);
    expect(wallet.identities[1].isImport).toBe(true);
    expect(wallet.identities[1].address).toBe(toChecksumAddress('31de24752489e04d06ad32a1095b86ce9310bf9b'));
  });

  var accountExporter;
  
  test('init Account exporter control', async () => {
    accountExporter = new AccountExporter();
    await accountExporter.auth.setPassword(password);
  });

  test('Account exporter control initWallet', () => {
    try {
      accountExporter.initWallet();
    } catch(err) {
      expect(err.message).toBe(errorsCode.DisableMethod);
    }
  });

  test('Account exporter control newAccountBySeed', () => {
    try {
      accountExporter.newAccountBySeed();
    } catch(err) {
      expect(err.message).toBe(errorsCode.DisableMethod);
    }
  });

  test('Account exporter control exportPrivateKeyFromSeed', async () => {
    global.storage[fields.WALLET].selectedAddress = 0;
    const account = await accountExporter.exportPrivateKeyFromSeed();
    expect(account.index).toBe(0);
    expect(account.privateKey).toBe('2295606db2e8a1baa70e08a169155f94eb3e908ac205013de74dd35b999b96b3');
  });

  test('Account exporter control wrong index exportAccountFromStore', async () => {
    try {
      await accountExporter.exportAccountFromStore();
    } catch(err) {
      expect(err.message).toBe(errorsCode.WrongIndex);
    }
  });

  test('Account exporter control index exportAccountFromStore', async () => {
    global.storage[fields.WALLET].selectedAddress = 1;
    const account = await accountExporter.exportAccountFromStore();
    expect(account.index).toBe(1);
    expect(account.privateKey).toBe(privateKey);
  });

  test('Account exporter control exportSeed', async () => {
    const { decryptSeed, decryptImported } = await accountExporter.exportSeed();
    expect(decryptImported).toEqual([{
      privateKey,
      index: 1
    }]);
    expect(decryptSeed).toBe(decryptSeed);
  });

  test('Account exporter control isImported', async () => {
    global.storage[fields.WALLET].selectedAddress = 1;

    let isImportAccount = await accountExporter.isImported();

    expect(isImportAccount).toBe(true);

    global.storage[fields.WALLET].selectedAddress = 0;
    
    isImportAccount = await accountExporter.isImported();

    expect(isImportAccount).toBe(false);
  });

});
