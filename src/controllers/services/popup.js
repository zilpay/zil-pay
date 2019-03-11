import { Loger } from '../../lib/logger'
import { InternalMessage, MTypesInternal } from '../../content/messages/messageTypes'

const log = new Loger('PROMT');
var openWindow = null;

export class PromptService {
  static async open (notification) {
    if (openWindow) {
      openWindow.close();
      openWindow = null;
    }

    const height = 480;
    const width = 600;
    let middleX = window.screen.availWidth / 2 - (width / 2);
    let middleY = window.screen.availHeight / 2 - (height / 2);

    const getPopup = async function() {
      try {
        const url = window.chrome.runtime.getURL('/index.html');

        if (typeof browser !== 'undefined') {
          const created = await window.chrome.windows.create({
            url, height, width, type: 'popup'
          });
          window.notification = notification;
          return created;
        } else {
          const win = window.open(
            url,
            'ZilPayPrompt',
            `width=${width},height=${height},resizable=0,top=${middleY},left=${middleX},titlebar=0`
          );
          win.data = notification;
          openWindow = win;
          return win;
        }
      } catch (err) {
        log.error(err);
        return null;
      }
    };

    let popup = await getPopup();

    popup.onbeforeunload = () => {
      openWindow = null;
      return undefined;
    };
  }

  static async close () {
    if (typeof browser !== 'undefined') {
      const { id: windowId } = (await window.chrome.windows.getCurrent());
      window.chrome.windows.remove(windowId);
    } else {
      window.onbeforeunload = () => { };
      window.close();
    }
  }
}

export class Prompt {
  constructor (type = '', domain = '', data = {}, responder = null) {
    this.type = type
    this.domain = domain
    this.data = data
    this.responder = responder
  }
  static placeholder () {
    return new Prompt()
  }
  static fromJson (json) {
    return Object.assign(this.placeholder(), json)
  }
  routeName () {
    return `prompt_${this.type}`
  }
  static isLocked () {
    return new Prompt('UNLOCK', '', {}, () => {})
  }
}