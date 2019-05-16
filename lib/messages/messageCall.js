import uuidv4 from 'uuid/v4'
import utils from '../../lib/utils'
import errors from '../../config/errors'
import extensionAPI from 'extensionizer'

var extension = extensionAPI;

if (process.env.NODE_ENV === 'test') {
  extension = {
    runtime: {
      sendMessage(...args) {} 
    },
    tabs: {
      query(...args) {},
      sendMessage(...args) {}
    }
  };
}

export class Message {
  // Message instance for send between scripts. //
  
  constructor(msg) {
    if (typeof msg.type !== 'string') {
      throw new Error(errors.MESSAGE_TYPE_ERR);
    } else if (typeof msg.payload !== 'object') {
      throw new Error(errors.PAYLOAD_TYPE_ERR);
    }
    Object.keys(msg).forEach(key => this[key] = msg[key]);
  }

  static signal(type) {
    return new Message({
      type,
      payload: {}
    });
  }

  send() {
    return new Promise(resolve => {
      try {
        extension.runtime.sendMessage(this, resolve);
      } catch(err) {
        window.location.reload();
      }
    });
  }
}

export class SecureMessage extends Message {
  
  constructor(msg) {
    super(msg);
    
    if (!msg.domain) {
      this.domain = utils.strippedHost();
    }
    if (!msg.id) {
      this.id = uuidv4();
    }
  }

  send(stream, recipient) {
    /**
     * @param {stream}: Encrypted stream.
     * @param recipient: String recipient (conten.js, inpage.js).
     */
    return stream.send(this, recipient);
  }

}

export class TabsMessage extends Message {
  
  constructor(msg) {
    super(msg);
  }

  static tabs() {
    /**
     * @returns {Promise}:
     *  title
     *  url
     *  favIconUrl
     *  id
     */
    return new Promise(resolve => {
      extension.tabs.query({ active: true }, resolve);
    });
  }

  async send () {
    const self = this;
    const tabs = await TabsMessage.tabs(); // get all active tabs.

    try {     
      tabs.forEach(
        // Sending to each tabs(pages) //
        tab => extension.tabs.sendMessage(tab.id, self)
      );
    } catch(err) {
      // If not tabs with ZilPay.
    }
  }
}
