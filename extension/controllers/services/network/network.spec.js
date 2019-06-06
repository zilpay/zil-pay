import { NetworkControl } from './index'
import ZilliqaConfig from '../../../../config/zil'
import fields from '../../../../config/fields'


describe('Test network control', () => {
  var networkControl;

  test('init network control', () => {
    networkControl = new NetworkControl();
  });


  test('change network', async () => {
    networkControl = new NetworkControl();
    const newSelected = 'testnet';
    const newNet = await networkControl.changeNetwork(newSelected);

    expect(newNet).toEqual({
      selected: newSelected,
      config: ZilliqaConfig,
      provider: ZilliqaConfig[newSelected]['PROVIDER']
    });
  });

  test('change config', async () => {
    networkControl = new NetworkControl();
    let forChangeConfig = ZilliqaConfig;

    forChangeConfig.private.PROVIDER = 'http://127.0.0.1:3000';
    forChangeConfig.private.MSG_VERSION = 3;

    const newConfig = await networkControl.changeConfig(forChangeConfig);

    expect(newConfig).toEqual(forChangeConfig);
    expect(newConfig).toEqual(global.storage[fields.CONFIG]);
  });

  test('network sync', async () => {
    networkControl = new NetworkControl();

    networkControl.selected = Object.keys(ZilliqaConfig)[0];

    const config = global.storage[fields.CONFIG];
    const selected = global.storage[fields.SELECTED_NET];

    await networkControl.netwrokSync();
    
    expect(networkControl.selected).toBe(selected);
    expect(networkControl.config).toEqual(config);
  });

});
