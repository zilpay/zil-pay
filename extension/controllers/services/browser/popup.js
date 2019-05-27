import { Loger } from '../../../../lib/logger'
import config from '../../../../config/api'
import extensionAPI from 'extensionizer'

var extension = extensionAPI;

if (process.env.NODE_ENV === 'test') {
  extension = {
    windows: {
      create() {},
      getAll() {},
      remove() {}
    }
  };
}

const log = new Loger('PROMT');

export class PromptService {

  constructor() {
    this._height = 600;
    this._width = 350;
    this._type = 'popup';

    this.id;
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
    const createData = {
      type: this._type,
      url: config.PROMT_PAGE,
      width: this._width,
      height: this._height,
      top: Math.max(notificationTop, 0),
      left: Math.max(notificationLeft, 0),
    };
    const lastPopups = await this._getPopup();

    if (lastPopups && lastPopups.length > 0) {
      lastPopups.forEach(popup => {
        extension.windows.remove(popup.id, console.error);
      });
    }

    try {
      extension.windows.create(createData, tab => this.id = tab.id);
    } catch(err) {
      log.error(err);
    }
  }

  _getPopup() {
    return new Promise(resolve => {
      extension.windows.getAll({}, tabs => {
        resolve(
          tabs.filter(tab => tab.type === this._type)
        );
      });
    });
  }
  
}
