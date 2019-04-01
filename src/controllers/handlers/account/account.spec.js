import { AccountCreater } from './create'
import { AccountExporter } from './export'
import fields from '../../../config/fields'
import { BuildObject } from '../../../lib/storage'
import { Auth } from '../auth/index'


const password = '123456';
const privateKey = '2301b67bf6fdfd20d328249585a6626f271fcf0c22cbfc66834203fbb78b1d06';
const decryptSeed = 'thumb face object present purse corn throw box anxiety seminar excess warfare';
const address = '3145f480324811c8941d058fd6e95677aa6257e1';
var encrypSeed = '21d4e42ecdd49d97da250f907ad6c2ac23f31cde270e3b83f5f3425466c22eeb4aac4a8df24229dff62e748124a3fa1c3e3bea83d08204ee9694b49a8b19305a74a6a4023f264db897cf78a633c10b';
const decryptImported = [
  { privateKey, index: 0 }
];

describe('Test account control', () => {

  it('Test init new Wallet', async () => {
    const accountCreater = new AccountCreater(password);

    accountCreater._storage.set = (objects) => {  
      const forTest = [
        new BuildObject(fields.VAULT, encrypSeed),
        new BuildObject(fields.VAULT_IMPORTED, '21fbd179'),
        new BuildObject(fields.WALLET, {
          identities: [{
            index: 0,
            address: '3145f480324811c8941d058fd6e95677aa6257e1',
            balance: objects[2][fields.WALLET].identities[0].balance
          }],
          selectedAddress: 0
        })
      ];
      expect(forTest).toEqual(objects);
    };
    
    const account = await accountCreater.initWallet(decryptSeed);

    expect(account).toEqual({
      index: 0,
      publicKey: '0206268fbbbab0933d01292d8192911a27c09ec9c6d0c562eef48f7fd8b3615514',
      address: '3145f480324811c8941d058fd6e95677aa6257e1',
      privateKey: '7012c97b4e319bfff75fe775fe1ee212341e1b1f7c0eb91945a064ba2d972bff',
      balance: account.balance
    });
  });

  it('Test add new account by seed', async () => {
    const accountCreater = new AccountCreater(password);

    accountCreater._auth.encryptSeed = encrypSeed;
    accountCreater._auth.encryptImported = '21fbd179';

    accountCreater._auth._storage.get = ([key0, key1]) => {
      if (key0 !== fields.VAULT) {
        throw new Error('param key0 must be vault, key0: ' + key0);
      } else if (key1 !== fields.VAULT_IMPORTED) {
        throw new Error('param key1 must be imported wallet, key1: ' + key1);
      }

      const encryptWallet = Auth.encryptWallet(decryptSeed, [], password);
      return {
        importedvault: encryptWallet.encryptImported,
        vault: encryptWallet.encryptSeed
      };
    };
    accountCreater._storage.get = async (key0) => {
      if (key0 !== fields.WALLET) {
        throw new Error('param key0 must be wallet, key0: ' + key0);
      }

      let object = {};

      object[fields.WALLET] = {
        identities: [{
          address,
          balance: 0,
          index: 0
        }],
        selectedAddress: 0
      };

      return await object; 
    }
  
    accountCreater._storage.set = ([objects]) => {
      const forTest = new BuildObject(fields.WALLET, {
        identities: [
        {
          address,
          balance: 0,
          index: 0
        },
        {
          index: 1,
          address: 'e90e4a1bd06a9ecc9a3212faf9f777c1f5b4a2d9',
          balance: objects[fields.WALLET].identities[1].balance
        }
        ],
        selectedAddress: 1
      });
      expect(forTest).toEqual(objects);
    };
    
    const account = await accountCreater.newAccountBySeed();

    expect(account).toEqual({
      index: 1,
      publicKey: '02e24df038a673a9b0fd0d57767199c19d9245e5aee641fdbc70ce78f3fb32a3ab',
      address: 'e90e4a1bd06a9ecc9a3212faf9f777c1f5b4a2d9',
      privateKey: 'e5e1ea9de8c1baf59c4d5f36a08c115ea1b658a0d49c5df88d8959053a6fecc7',
      balance: account.balance
    });
  });

  it('Test add first account by privateKey', async () => {
    const accountExporter = new AccountExporter(password);

    accountExporter._auth._storage.get = ([key0, key1]) => {
      if (key0 !== fields.VAULT) {
        throw new Error('param key0 must be vault, key0: ' + key0);
      } else if (key1 !== fields.VAULT_IMPORTED) {
        throw new Error('param key1 must be imported wallet, key1: ' + key1);
      }

      const encryptWallet = Auth.encryptWallet(decryptSeed, [], password);
      return {
        importedvault: encryptWallet.encryptImported,
        vault: encryptWallet.encryptSeed
      };
    };

    accountExporter._auth._storage.set = (inputObject) => {
      const encryptImported = '21fbf70782dfd395de3e36922f84849562f74ec7230a3c83d0e21b78318a01ac58fc15cefe546ad5e27765c520a8b00c3b66a0d287c244fbddc4b8c5d34a741c23e9f6012f335dacc48f7da527c71f55bf3036434d75a857882910d9481f0f632e05e4de739279697db0c27057484d6718764c36420e2d84b29e8cb9c5439e4328ef68ec1bbbdf0cb31337840da0dd9eb992297085a8924c3de02118aee7cfb275b494bee408a2fd46832fb0';
      const object = new BuildObject(
        fields.VAULT_IMPORTED,
        encryptImported
      );
      expect(object).toEqual(inputObject);
    }

    const account = await accountExporter.exportAccountByPrivateKey(privateKey);
  
    expect(account).toEqual({
      privateKey,
      index: 0,
      publicKey: '024e92663f20bf30bd9b7847a5327b97f0ef0579aefd2d210ee4e30239acb0f609',
      address: '31de24752489e04d06ad32a1095b86ce9310bf9b',
      balance: account.balance
    });
  });

});