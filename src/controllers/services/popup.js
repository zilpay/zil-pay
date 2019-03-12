import { Loger } from '../../lib/logger'
import config from '../../config/api'
// import { InternalMessage, MTypesInternal } from '../../content/messages/messageTypes'


const log = new Loger('PROMT');

export class PromptService {

  constructor(msg) {
    if (typeof msg.type !== 'string' || typeof msg.domain !== 'string') {
      throw new Error('params type, domain can be string');
    } else if (typeof msg.payload !== 'object') {
      throw new Error('params payload can be object');
    }

    this._height = 600;
    this._width = 350;
    this._extPageUtl = window.chrome
                             .runtime
                             .getURL(`/${config.PROMT_PAGE}`);
    this._titile = config.PROMT_TITLE;
    this._winParams = `width=${this._width},height=${this._height},resizable=0,
                       ,titlebar=0`;
    this.data = msg;
  }

  open() {
    try {
      this._win_ = window.open(
        this._extPageUtl,
        this._titile,
        this._winParams
      );
      this._win_.data = this.data;
    } catch(err) {
      log.error(err);
    }
  }

  
}
