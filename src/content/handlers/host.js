import EventEmitter from 'eventemitter3';
import randomUUID from 'uuid/v4';
import extensionizer from 'extensionizer';
import Logger from '../../lib/logger'

const logger = new Logger('ZilPay.Host');


export default class extends EventEmitter {
  constructor() {
    super();

    this.channels = new Map();
    this.incoming = new Map(); // Incoming message replies
    this.outgoing = new Map(); // Outgoing message replies

    extensionizer.runtime.onConnect.addListener(channel => (
      this.handleNewConnection(channel)
    ));
  }

  handleNewConnection(channel) {
    let extensionID = channel.sender.id;
    let uuid = randomUUID();

    if(extensionID !== extensionizer.runtime.id) {
      channel.disconnect();
      return logger.warn(
        `Dropped unsolicited connection from ${ extensionID }`
      );
    }

    let { name, sender: {url} } = channel;

    if(!this.channels.has(name)) {
      this.emit(`${ name }:connect`);
    }

    let channelList = (this.channels.get(name) || new Map());
    let hostname = new URL(url).hostname;

    this.channels.set(name, channelList.set(uuid, { channel, url }));

    channel.onMessage.addListener(message => (
      this.handleMessage(name, { ...message, hostname })
    ));

    channel.onDisconnect.addListener(() => {
      // Delete any pending requests that match this name + id
      let channelList = this.channels.get(name);

      if(!channelList) {
        return null;
      }

      channelList.delete(uuid);

      if(!channelList.size) {
        this.channels.delete(name);
        this.emit(`${ name }:disconnect`);
      }
    });
  }

  handleMessage(source, message) {
    let { noAck = false, hostname, messageID, action, data } = message;

    if(action == 'messageReply') {
      return this.handleReply(data);
    }

    if(source == 'tab' && ![ 'tabRequest' ].includes(action)) {
      return logger.error(
        `Droping unauthorized tab request: ${ action }`,
        data
      );
    }

    if(noAck) {
      return this.emit(action, { hostname, data });
    }

    this.incoming.set(messageID, res => (
      this.send(source, 'messageReply', {
        messageID, ...res
      }, false)
    ));

    this.emit(action, {
      resolve: res => {
        if(!this.incoming.get(messageID)) {
          return logger.warn(`Message ${ messageID } expired`);
        }

        this.incoming.get(messageID)({ error: false, res });
        this.incoming.delete(messageID);
      },
      reject: res => {
        if(!this.incoming.get(messageID)) {
          return logger.warn(`Message ${ messageID } expired`);
        }

        this.incoming.get(messageID)({ error: true, res });
        this.incoming.delete(messageID);
      },
      data, hostname
    });
  }

  handleReply({ messageID, error, res }) {
    if(!this.outgoing.has(messageID)) {
      return null;
    }

    if(error) {
      this.outgoing.get(messageID)(Promise.reject(res));
    } else {
      this.outgoing.get(messageID)(res);
    }

    this.outgoing.delete(messageID);
  }

  broadcast(action, data, requiresAck = true) {
    return Promise.all([ ...this.channels.keys() ].map(channelGroup => (
      this.send(channelGroup, action, data, requiresAck)
    )));
  }

  send(target = false, action, data, requiresAck = true) {
    if(!this.channels.has(target)) {
      return null;
    }

    if(!requiresAck) {
      return this.channels.get(target).forEach(({ channel }) => (
        channel.postMessage({ action, data, noAck: true })
      ));
    }

    return new Promise((resolve, reject) => {
      let messageID = randomUUID();

      this.outgoing.set(messageID, resolve);

      this.channels.get(target).forEach(({ channel }) => (
        channel.postMessage({ action, data, messageID, noAck: false })
      ));
    });
  }

}
