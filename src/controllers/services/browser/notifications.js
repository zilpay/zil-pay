import extension from 'extensionizer'


export class NotificationsControl {

  static counter(number) {
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
    const data = {
      'type': 'basic',
      'title': this.title,
      'iconUrl': extension.extension.getURL('/icon.png'),
      'message': this.message,
    };
    extension.notifications.create(this.url, data);
    this._notificationClicked();
  }

  _notificationClicked() {
    const onClicked = extension.notifications.onClicked;
    
    onClicked.addListener((onExplorerTx, _) => {
      extension.tabs.create({ url: onExplorerTx });
    });
  }

}
