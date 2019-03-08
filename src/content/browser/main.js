import { Inject } from './inject'
import { Stream } from './stream'
import Config from '../../config/api'


export class BrowserContent extends Stream {  
  constructor() {
    super();
    this._inject = new Inject(Config.INPAGE_NAME);
    this.watchTabMessaging();
  }
}