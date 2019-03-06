import EventEmitter from 'eventemitter3';

export default class extends EventEmitter {

  constructor(channelKey = false) {
    super();

    if(!channelKey) {
      throw 'No channel scope provided';
    }

    this._channelKey = channelKey;
    this._registerEventListener();
  }

  _registerEventListener() {
    window.addEventListener(
      'message',({ data: { isZilPay = false, message, source } }) => {
      if(!isZilPay || (!message && !source)) {
        return null;
      }

      if(source === this._channelKey) {
        return null;
      }

      let { action, data } = message;

      this.emit(action, data);
    });
  }

  send(action = false, data = {}) {
      if(!action)
          return { success: false, error: 'Function requires action {string} parameter' };

      window.postMessage({
          message: { action, data },
          source: this._channelKey,
          isZilPay: true
      }, '*');
  }

}
