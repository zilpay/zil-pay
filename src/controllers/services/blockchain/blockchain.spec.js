import { ZilliqaControll } from './zilliqa'
import { NetworkControl } from '../network/index'
import ZilliqaConfig from '../../../config/zil'

const jestTimeOut = 20000;
const networkControl = new NetworkControl();
const decryptSeed = 'thumb face object present purse corn throw box anxiety seminar excess warfare';
const publicKey = '0206268fbbbab0933d01292d8192911a27c09ec9c6d0c562eef48f7fd8b3615514';
const address = '3145f480324811c8941d058fd6e95677aa6257e1';
const privateKey = '7012c97b4e319bfff75fe775fe1ee212341e1b1f7c0eb91945a064ba2d972bff';
const txParams = {
  amount: '0',
  code: '',
  data: '',
  gasLimit: '1',
  gasPrice: '1000000000',
  pubKey: publicKey,
  toAddr: '0xeef22809b26479ce53f52a0849dbbdad630e0f35'
};

describe('Test zilliqa control', () => {

  it('Test Zilliqa get account by seed', async () => {
    networkControl.selected = Object.keys(ZilliqaConfig)[1];
    const zilliqa = new ZilliqaControll(networkControl.provider);
    const index = 0;
    const account = await zilliqa.getAccountBySeed(decryptSeed, index);

    expect(account).toEqual({
      index, publicKey, address, privateKey,
      balance: account.balance
    });
  }, jestTimeOut);

  it('Test Zilliqa get account by privateKey', async () => {
    networkControl.selected = Object.keys(ZilliqaConfig)[1];
    const zilliqa = new ZilliqaControll(networkControl.provider);
    const index = 0;
    const account = await zilliqa.getAccountByPrivateKey(privateKey);

    expect(account).toEqual({
      index, publicKey, address, privateKey,
      balance: account.balance
    });
  }, jestTimeOut);

  it('Test Zilliqa get version network', async () => {
    networkControl.selected = Object.keys(ZilliqaConfig)[1];
    const zilliqa = new ZilliqaControll(networkControl.provider);
    const version = await zilliqa.version(networkControl.version);
    const current = 21823489;

    expect(version).toBe(current);
    expect(version).not.toBeNull();
    expect(version).not.toBeUndefined();
  }, jestTimeOut);

  it('Test Zilliqa get balance and nonce from address', async () => {
    networkControl.selected = Object.keys(ZilliqaConfig)[1];
    const zilliqa = new ZilliqaControll(networkControl.provider);
    const { result, nonce } = await zilliqa.getBalance(address);

    expect(result).not.toBeNull();
    expect(nonce).not.toBeNull();

    expect(result).not.toBeUndefined();
    expect(nonce).not.toBeUndefined();

    expect(result).toBeDefined();
    expect(nonce).toBeDefined();
  }, jestTimeOut);

  it('Test Zilliqa singTransaction by privateKey', async () => {   
    networkControl.selected = Object.keys(ZilliqaConfig)[1];
    const zilliqa = new ZilliqaControll(networkControl.provider);
    const { nonce } = await zilliqa.getBalance(address);
    const resultPrivKey = await zilliqa.singTransaction(
      Object.assign(txParams, { nonce }),
      privateKey,
      0,
      networkControl.version
    );
    const resultSeed = await zilliqa.singTransaction(
      Object.assign(txParams, { nonce }),
      decryptSeed,
      0,
      networkControl.version
    );
    expect(resultPrivKey).not.toBeNull();
    expect(resultPrivKey).not.toBeUndefined();
    expect(resultSeed).not.toBeNull();
    expect(resultSeed).not.toBeUndefined();

    if (resultSeed.error || resultPrivKey.error) {
      console.log(resultPrivKey.error.message, resultSeed.error.message);
    } else {
      expect(resultPrivKey.result.TranID).not.toBeNull();
      expect(resultPrivKey.result.Info).not.toBeNull();
      expect(resultPrivKey.result.TranID).not.toBeUndefined();
      expect(resultPrivKey.result.Info).not.toBeUndefined();
      
      expect(resultSeed.result.TranID).not.toBeNull();
      expect(resultSeed.result.Info).not.toBeNull();
      expect(resultSeed.result.TranID).not.toBeUndefined();
      expect(resultSeed.result.Info).not.toBeUndefined();

      expect(resultSeed.result.TranID).toBe(resultPrivKey.result.TranID);

      console.log(resultSeed.result.TranID);
      console.log(resultSeed.result.Info);
    }
  }, jestTimeOut);
  
});