import { Loger } from '../../lib/logger'
import config from '../../config/api'
import extension from 'extensionizer'


const log = new Loger('PROMT');

export class PromptService {

  constructor() {
    this._height = 600;
    this._width = 350;

    this._titile = config.PROMT_TITLE;
  }

  async open() {
    const {
      screenX,
      screenY,
      outerWidth,
      outerHeight
    } = window;
    const notificationTop = Math.round(
      screenY + (outerHeight / 2) - (this._height / 2)
    );
    const notificationLeft = Math.round(
      screenX + (outerWidth / 2) - (this._width / 2)
    );

    try {
      this._win_ = await extension.windows.create({
        url: config.PROMT_PAGE,
        type: 'popup',
        titlePreface: this._titile,
        width: this._width,
        height: this._height,
        top: Math.max(notificationTop, 0),
        left: Math.max(notificationLeft, 0),
        incognito: true
      });
    } catch(err) {
      log.error(err);
    }
  }
  
}
