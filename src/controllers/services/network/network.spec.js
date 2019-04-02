import { NetworkControl } from './index'
import ZilliqaConfig from '../../../config/zil'
import errorsCode from './errors'

describe('Test network control', () => {

  it('Get default network object', () => {
    const defaultSelected = Object.keys(ZilliqaConfig)[0];
    const netControll = new NetworkControl();
    expect(netControll.config).toBe(ZilliqaConfig);
    expect(netControll.selected).toBe(defaultSelected);
  });

  it('Test change network method', async () => {
    const netControll = new NetworkControl();
    const newSelected = Object.keys(ZilliqaConfig)[0];

    netControll._storage.set = () => true;
    
    await netControll.changeNetwork(newSelected);

    expect(newSelected).toBe(netControll.selected);
  });

  it('Test change wrong network method', async () => {
    const netControll = new NetworkControl();
    const wrongSelected = 'wrongNetwork';
    
    try {
      await netControll.changeNetwork(wrongSelected);
    } catch(err) {
      expect(err.message).toBe(
        `${errorsCode.changeNetwork}
         ${Object.keys(netControll.config)}`
      );
    }
  });

  it('Test change config method', async () => {
    const netControll = new NetworkControl();

    netControll._storage.set = () => true;

    await netControll.changeConfig(ZilliqaConfig);

    expect(ZilliqaConfig).toBe(netControll.config);
  });

  it('Test change wrong config method', async () => {
    const netControll = new NetworkControl();
    const param = 312321;
    
    try {
      await netControll.changeConfig(param);
    } catch(err) {
      expect(err.message).toBe(errorsCode.changeNetwork + ' ' + typeof param);
    }
  });

  it('Test sync config and selected method', async () => {
    const netControll = new NetworkControl();

    netControll._storage.get = () => {
      return {
        selectednet: Object.keys(ZilliqaConfig)[0],
        config: ZilliqaConfig
      };
    };

    await netControll.netwrokSync();

    expect(netControll.config).toEqual(ZilliqaConfig);
    expect(netControll.selected).toBe(Object.keys(ZilliqaConfig)[0]);
  });

});