import { Loger } from '../../lib/logger'
import config from '../../config/api'


const log = new Loger('PROMT');

export class PromptService {

  constructor(tab) {
    this._height = 600;
    this._width = 350;
    this._extPageUtl = window.chrome
                             .runtime
                             .getURL(`/${config.PROMT_PAGE}`);

    this._titile = config.PROMT_TITLE;
    this._winParams = `width=${this._width},height=${this._height},resizable=0,
                       ,titlebar=0`;
    this.data = tab;
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
