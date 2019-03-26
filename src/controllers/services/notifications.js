export class NotificationsControl {

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
    window.chrome.notifications.create(
      this.url,
      {
        'type': 'basic',
        'title': this.title,
        'iconUrl': window.chrome.extension.getURL('/icon.png'),
        'message': this.message,
      }
    );
  }
}