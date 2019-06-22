import uuidv4 from 'uuid/v4'
import { toChecksumAddress } from '@zilliqa-js/crypto';
import {
  WalletHandler,
  AccountHandler,
  ZilliqaHandler,
  NetworkHandler,
  TransactionHandler
} from './handlers'
import zilConfig from '../../config/zil'
import fields from '../../config/fields'


const defaultSelected = Object.keys(zilConfig)[0];
const password = uuidv4();
const seed = 'banana blind business arrest escape blame stadium display border flower daughter story';
describe('handlers for background page', () => {
  test('WalletHandler.initPopup first run', async () => {
    await new WalletHandler().initPopup(value => {
      expect(value.reject.isEnable).toBe(false);
      expect(value.reject.isReady).toBe(false);
      expect(value.reject.selectednet).toBe(defaultSelected);
      expect(value.reject.networkStatus).toBe(true);
      expect(value.reject.config).toEqual(zilConfig);
    });
  });

  test('WalletHandler.initWallet first run', async () => {
    await new WalletHandler({ password, seed }).initWallet(value => {
      expect(value.resolve.selectedAddress).toBe(0);
      expect(value.resolve.identities[0].address).toBe(toChecksumAddress('a359105c9c8fda34278186c564ca2d3664e86821'));
      expect(value.resolve.identities[0].index).toBe(0);
    });
  });

  test('WalletHandler.initPopup two run', async () => {
    await new WalletHandler().initPopup(value => {
      expect(value.resolve.isEnable).toBe(true);
      expect(value.resolve.isReady).toBe(true);
      expect(value.resolve.networkStatus).toBe(true);
      expect(value.resolve.data.config).toEqual(zilConfig);
      expect(value.resolve.data.wallet).not.toBeNull();
    });
  });

  test('WalletHandler.getRandomSeedPhrase', async () => {
    await new WalletHandler().getRandomSeedPhrase(value => {
      const seed = value.resolve;
      expect(seed).not.toBeNull();
      expect(seed).toBeDefined();
    });
  });

  test('WalletHandler.changeAccountName', async () => {
    const name = 'nix assasin';

    await new WalletHandler({name}).changeAccountName(value => {
      expect(value.resolve).toBe(true);
    });
  });

  test('AccountHandler.exportPrivateKey', async () => {
    await new AccountHandler({ password }).exportPrivateKey(value => {
      expect(value.resolve).toBe('2295606db2e8a1baa70e08a169155f94eb3e908ac205013de74dd35b999b96b3');
    });
  });

  test('AccountHandler.exportSeedPhrase', async () => {
    await new AccountHandler({ password }).exportSeedPhrase(value => {
      expect(value.resolve).toBe(seed);
    });
  });

  test('AccountHandler.importPrivateKey', async () => {
    const privKey = '3375F915F3F9AE35E6B301B7670F53AD1A5BE15D8221EC7FD5E503F21D3450C8';
    await new AccountHandler({ privKey }).importPrivateKey(value => {

      if (value.resolve) {
        expect(value.resolve.selectedAddress).toEqual(1);
        expect(
          value.resolve.selectedAddress
        ).toEqual(
          value.resolve.identities[1].index
        );
        expect(value.resolve.identities[1].address).toEqual(toChecksumAddress('8254b2c9acdf181d5d6796d63320fbb20d4edd12'));
        expect(value.resolve.identities[1].isImport).toBe(true);
      }
    });
  });

  test('AccountHandler.createAccountBySeed', async () => {
    await new AccountHandler().createAccountBySeed(value => {
      expect(value.resolve.selectedAddress).toEqual(2);
      expect(value.resolve.identities[2].index).toEqual(1);
      expect(value.resolve.identities[2].address).toEqual(toChecksumAddress('9ed19dd4c5d011eb458bbfda6d06d2db7ef9244f'));
    });
  });

  test('AccountHandler.changeAddress', async () => {
    let changeWallet = Object.assign(
      global.storage[fields.WALLET],
      { selectedAddress: 0 }
    );
    changeWallet[fields.WALLET] = changeWallet;

    await new AccountHandler(changeWallet).changeAddress(value => {
      expect(value).toBe(true);
      expect(changeWallet[fields.WALLET]).toEqual(global.storage[fields.WALLET]);
    });
  });

  test('AccountHandler.balanceUpdate', async () => {
    await new AccountHandler().balanceUpdate(value => {
      expect(value.resolve).not.toBeNull();
    });
  });

  test('ZilliqaHandler.initZilPay', async () => {
    await ZilliqaHandler.initZilPay(value => {
      expect(value.provider).toBe(zilConfig[defaultSelected]['PROVIDER']);
      expect(value.isEnable).toBe(true);
      if (value.isConnect) {
        expect(value.account.address).toEqual(toChecksumAddress('a359105c9c8fda34278186c564ca2d3664e86821'));
      } else {
        expect(value.account).toBe(null);
      }
    });
  });

  test('NetworkHandler.changeNetwork', async () => {
    const selectednet = Object.keys(zilConfig)[1];
    await new NetworkHandler({ selectednet }).changeNetwork(value => {
      expect(value).toBe(true);
      expect(selectednet).toBe(global.storage[fields.SELECTED_NET]);
    });
  });

  test('NetworkHandler.changeConfig', async () => {
    let config = zilConfig;

    config[fields.CONFIG] = config;

    await new NetworkHandler(config).changeConfig(value => {
      expect(value.resolve).toBe(true);
    });
  });

  test('TransactionHandler.callTransaction', async () => {
    const tx = {
      amount: '0',
      code: '',
      data: '',
      gasLimit: '1',
      gasPrice: '1000000000',
      toAddr: '1b9bEE83A721B6e63Ba4819D0c9ce2D16C521Bd3'
    };
    await new TransactionHandler(tx).callTransaction(value => {
      expect(value.resolve).toBe(true);
      expect(tx).toEqual(global.storage[fields.CONFIRM_TX][0]);
    });
  });

  test('TransactionHandler.buildTransaction', async () => {
    let nonceForTest;
    const payload = {
      gasLimit: '1',
      gasPrice: '1000000000'
    };
    const selectednet = Object.keys(zilConfig)[1];
    const wallet = global.storage[fields.WALLET];
    const selectedAddress = wallet.identities[
      wallet.selectedAddress
    ].address;
    const tx = global.storage[fields.CONFIRM_TX][0];

    await new TransactionHandler(payload).buildTransaction(value => {
      expect(value.resolve.from).toBe(selectedAddress);
      expect(payload.gasLimit).toBe(value.resolve.gasLimit);
      expect(payload.gasPrice).toBe(value.resolve.gasPrice);
      expect(tx.amount).toBe(value.resolve.amount);
      expect(tx.toAddr).toBe(value.resolve.toAddr);

      const txList = global.storage[
        fields.TRANSACTIONS
      ][selectedAddress][selectednet][0];

      expect(txList).toEqual({
        Info: value.resolve.Info,
        TranID: value.resolve.TranID,
        amount: value.resolve.amount,
        toAddr: value.resolve.toAddr,
        nonce: value.resolve.nonce
      });
      nonceForTest = value.resolve.nonce;
    });

    await new TransactionHandler({
      amount: '0',
      code: '',
      data: '',
      gasLimit: '1',
      gasPrice: '1000000000',
      toAddr: '1b9bEE83A721B6e63Ba4819D0c9ce2D16C521Bd3'
    }).callTransaction(console.log);

    await new TransactionHandler(payload).buildTransaction(value => {
      expect(value.resolve.nonce).toBe(nonceForTest + 1);
    });
  }, 20000);


  test('ZilliqaHandler.rmAllTransactionList', async () => {
    await ZilliqaHandler.rmAllTransactionList();
  });

});
