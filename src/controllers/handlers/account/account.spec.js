import { AccountCreater } from './create'
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


var wallet = {
	"identities": [
		{
			"address": "eef22809b26479ce53f52a0849dbbdad630e0f35",
			"balance": "1263171089999999",
			"index": 0
		}
	],
	"selectedAddress": 0
};

function emulationStorageGet(key) {
  switch (key) {
    case fields.WALLET:
      return wallet;

    case fields.VAULT:
      return encrypSeed;

    default:
      throw new Error('key fail');
  }
}

function emulationStorageSet(buildObject) {
  const object = [
    new BuildObject(fields.WALLET, {
      identities: [{
        address,
        balance: buildObject[0][fields.WALLET].identities[0].balance,
        index: 0
      }],
      selectedAddress: 0
    }),
    new BuildObject(fields.VAULT, '21d4e42ecdd49d97da250f907ad6c2ac23f31cde270e3b83f5f3425466c22eeb4aac4a8df24229dff62e748124a3fa1c3e3bea83d08204ee9694b49a8b19305a74a6a4023f264db897cf78a633c10b')
  ];

  expect(buildObject).toEqual(object);
}


describe('Test account control', () => {

  it('Test create account by seed and 0 index', async () => {
    const accountCreater = new AccountCreater(password);

    accountCreater._storage.get = emulationStorageGet;
    accountCreater._storage.set = emulationStorageSet;

    const account = await accountCreater.newAccountBySeed(decryptSeed);

    expect(account).toEqual({
      address,
      index: 0,
      balance: account.balance,
      publicKey: '0206268fbbbab0933d01292d8192911a27c09ec9c6d0c562eef48f7fd8b3615514',
      privateKey: '7012c97b4e319bfff75fe775fe1ee212341e1b1f7c0eb91945a064ba2d972bff'
    });
  });

  it('Test create account by PrivateKey', async () => {
    const accountCreater = new AccountCreater(password);
    const index = 1;
    const privateKey = '1b6666c3b07a1d783553ebc2dfd8b657edf03110457442b02830539d7b62df0a';
    
    accountCreater._auth._storage.get = () => {
      const encryptWallet = Auth.encryptWallet(decryptSeed, decryptImported, password);
      return {
        importedvault: encryptWallet.encryptImported,
        vault: encryptWallet.encryptSeed
      };
    };
    accountCreater._auth._storage.set = (object) => {
      if (!object.hasOwnProperty(fields.VAULT_IMPORTED)) {
        throw new Error('key input fail');
      }
    };

    const account = await accountCreater.newAccountByPrivateKey(
      privateKey,
      index
    );

    expect(account).toEqual({
      index,
      publicKey: '03a391fa2fd0df667b59aa31049cfedb1186be9002c42fd5fafb3af5045b3ab17a',
      address: '670467c41ca7bccb4cbbc0eb2e6a116952f9e063',
      privateKey: privateKey,
      balance: account.balance
    });
  });

  it('Test init account by PrivateKey', async () => {
    const accountCreater = new AccountCreater(password);
    const index = 1;
    const privateKey = '1b6666c3b07a1d783553ebc2dfd8b657edf03110457442b02830539d7b62df0a';
    
    accountCreater._auth._storage.get = () => {
      const encryptWallet = Auth.encryptWallet(decryptSeed, [], password);
      return {
        importedvault: undefined,
        vault: encryptWallet.encryptSeed
      };
    };
    accountCreater._auth._storage.set = (object) => {
      if (!object.hasOwnProperty(fields.VAULT_IMPORTED)) {
        throw new Error('key input fail');
      }
    };

    const account = await accountCreater.newAccountByPrivateKey(
      privateKey,
      index
    );

    expect(account).toEqual({
      index,
      publicKey: '03a391fa2fd0df667b59aa31049cfedb1186be9002c42fd5fafb3af5045b3ab17a',
      address: '670467c41ca7bccb4cbbc0eb2e6a116952f9e063',
      privateKey: privateKey,
      balance: account.balance
    });
  });

  it('Test create account by seed and init wallet', async () => {
    const accountCreater = new AccountCreater(password);

    wallet = undefined;
    encrypSeed = undefined;

    accountCreater._storage.get = emulationStorageGet;
    accountCreater._storage.set = emulationStorageSet;

    const account = await accountCreater.newAccountBySeed(decryptSeed);

    expect(account).toEqual({
      address,
      index: 0,
      balance: account.balance,
      publicKey: '0206268fbbbab0933d01292d8192911a27c09ec9c6d0c562eef48f7fd8b3615514',
      privateKey: '7012c97b4e319bfff75fe775fe1ee212341e1b1f7c0eb91945a064ba2d972bff'
    });
  });

});