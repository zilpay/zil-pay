import extensionAPI from 'extensionizer'

var extension = extensionAPI;

if (process.env.NODE_ENV === 'test') {
  extension = {
    extension: {
      getURL(...args) {} 
    },
    browserAction: {
      setBadgeText(...args) {}
    },
    tabs: {
      create(...args) {}
    },
    notifications: {
      create(...args) {}
    }
  };
}


export class NotificationsControl {

  static counter(number) {
    /**
     * @method: Create text on icon bar-extensions of browser.
     */
    extension.browserAction.setBadgeText({
      text: `${number}`
    });
  }

  constructor({ url, title, message }) {
    if (typeof url !== 'string' || typeof title !== 'string' || typeof message !== 'string') {
      throw new Error(
        `url, title, message most be string.
        url: ${typeof url}, 
        title: ${typeof title}, 
        message: ${typeof message}`
      );
    }
    
    this.url = url;
    this.title = title;
    this.message = message;
  }

  create() {
    /**
     * @method: Create popUp window for confirm transaction.
     */
    const data = {
      'type': 'basic',
      'title': this.title,
      'iconUrl': extension.extension.getURL('/icon128.png'),
      'message': this.message,
    };
    extension.notifications.create(this.url, data);
    this._notificationClicked();
  }

  _notificationClicked() {
    if (!extension.notifications.onClicked.hasListener(this._viewOnViewBlock)) {
      extension.notifications.onClicked.addListener(this._viewOnViewBlock)
    }
  }

  _viewOnViewBlock(viewBlockUrl) {
    extension.tabs.create({ url: viewBlockUrl });
  }

}
