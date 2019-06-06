import { ZilliqaControl } from './zilliqa'
import { NetworkControl } from '../network'
import { toChecksumAddress } from '@zilliqa-js/crypto';
import fields from '../../../../config/fields'


const decryptSeed = 'banana blind business arrest escape blame stadium display border flower daughter story';

describe('Test zilliqa control', () => {
  const networkControl = new NetworkControl();
  var zilliqaControl;

  test('init zilliqa control', () => {
    zilliqaControl = new ZilliqaControl(
      networkControl.provider
    );
  });

  test('get account by seed', async () => {
    zilliqaControl = new ZilliqaControl(
      networkControl.provider
    );
    const index = 0;
    const account = await zilliqaControl.getAccountBySeed(
      decryptSeed, index
    );

    expect(account.address).toBe(toChecksumAddress('a359105c9c8fda34278186c564ca2d3664e86821'));
    expect(account.index).toBe(index);
    expect(account.privateKey).toBe('2295606db2e8a1baa70e08a169155f94eb3e908ac205013de74dd35b999b96b3');
  });

  test('get account by privatekey', async () => {
    zilliqaControl = new ZilliqaControl(
      networkControl.provider
    );
    const privkey = '3375F915F3F9AE35E6B301B7670F53AD1A5BE15D8221EC7FD5E503F21D3450C8';
    const address = '8254b2c9acdf181d5d6796d63320fbb20d4edd12';
    const index = 0;
    const account = await zilliqaControl.getAccountByPrivateKey(
      privkey, index
    );

    expect(account.address).toBe(toChecksumAddress(address));
    expect(account.index).toBe(index);
    expect(account.privateKey).toBe(privkey);
  });

  test('add and rm transaction for confirm', async () => {
    zilliqaControl = new ZilliqaControl(
      networkControl.provider
    );
    let tx = {
      amount: '1239201312789',
      code: '',
      data: '',
      gasLimit: '123',
      gasPrice: '1000000000',
      toAddr: '0x1b9bEE83A721B6e63Ba4819D0c9ce2D16C521Bd3'
    };

    await zilliqaControl.addForSingTransaction(tx);
    expect(tx).toEqual(global.storage[fields.CONFIRM_TX][0]);

    tx.amount = '0'

    await zilliqaControl.addForSingTransaction(tx);
    expect(tx).toEqual(global.storage[fields.CONFIRM_TX][1]);
    await zilliqaControl.rmForSingTransaction(); // remove last tx.
    expect(tx).toEqual(global.storage[fields.CONFIRM_TX][0]);
  });

  test('add sent transaction to list', async () => {
    zilliqaControl = new ZilliqaControl(
      networkControl.provider
    );
    const tx = {
      Info: 'Contract Txn, Sent To Ds',
      TranID: 'd1c197340e834ede4c2203a4594316c47cf1961887a9bc6f8d804bd6adbccbcd',
      amount: '1000000000000',
      toAddr: '0x1b9bEE83A721B6e63Ba4819D0c9ce2D16C521Bd3',
      nonce: 106,
      from: '0xEEf22809B26479ce53F52A0849DbBDAd630E0F35'
    };

    await zilliqaControl.addTransactionList(tx, networkControl.selected);

    let data = {};

    data[tx.from] = {};
    data[tx.from][networkControl.selected] = {};
    data[tx.from][networkControl.selected] = [{
      Info: tx.Info,
      TranID: tx.TranID,
      amount: tx.amount,
      toAddr: tx.toAddr,
      nonce: tx.nonce
    }];
    
    expect(data).toEqual(global.storage[fields.TRANSACTIONS]);
  });

});
