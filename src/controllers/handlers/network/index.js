import ZilliqaConfig from '../../../config/zil'
import errorsCode from './errors'
import { BrowserStorage, BuildObject } from '../../../lib/storage'
import fields from '../../../config/fields'


const defaultSelected = Object.keys(ZilliqaConfig)[2];

export class NetworkControl {

  get provider() {
    return this.config[this.selected]['PROVIDER'];
  }

  get version() {
    return this.config[this.selected]['MSG_VERSION'];
  }

  constructor(config=ZilliqaConfig, selected=defaultSelected) {
    this.config = config;
    this.selected = selected;
    this._storage = new BrowserStorage();
  }

  async changeNetwork(selected) {
    if (!this.config.hasOwnProperty(selected)) {
      throw new Error(
        `${errorsCode.changeNetwork}
         ${Object.keys(this.config)}`
      );
    }

    await this._storage.set(
      new BuildObject(fields.SELECTED_NET, selected)
    );
    this.selected = selected;

    return {
      selected,
      config: this.config,
      provider: this.provider
    };
  }

  async changeConfig(config=ZilliqaConfig) {
    if (typeof config !== 'object') {
      throw new Error(
        `${errorsCode.changeNetwork} ${typeof config}`
      );
    }

    await this._storage.set(
      new BuildObject(fields.CONFIG, config)
    );
    this.config = config;

    return this.config;
  }

  async netwrokSync() {
    const { config, selectednet } = await this._storage.get(
      [fields.SELECTED_NET, fields.CONFIG]
    );

    this.config = config;
    this.selected = selectednet;

    return {
      config,
      selected: this.selected
    };
  }

}
