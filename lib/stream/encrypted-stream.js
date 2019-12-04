import uuidv4 from 'uuidv4'
import { AES } from '../crypto'

const aes = new AES()

/**
 * Used for communication between a web page and an extension's content script.
 * Data passed between the two is encrypted to fight man-in-the-middle attacks.
 */
export class EncryptedStream {

  /**
   * Creates a new EncryptedStream.
   * @param {String} eventName - Event type.
   * @param {String, UUIDV4} uuid - Random key used for encryption.
   */
  constructor(eventName, uuid) {
    if (!uuidv4.isUuid(uuid)) {
      throw new Error('uuid must be uuidv4')
    }

    this.eventName = eventName
    this.key = uuid
    this.synced = false
    this.syncFn = null
    this.listenForSync()
  }

  /**
   * Message listener that returns decrypted messages when synced
   * @param {Function} cb - A message handler method.
   */
  listenWith(cb) {
    document.addEventListener(this.eventName, (event) => {
      if(!this.synced) {
        return false
      }

      let msg = JSON.parse(event.detail)

      if (this.synced || typeof msg === 'string') {
        msg = aes.decrypt(msg, this.key)
      }

      cb(msg)
    })
  }

  /**
   * Message sender which encrypts messages and adds the sender.
   * @param {Object, Array, String} data - The payload to send.
   * @param {String} to - The stream to send messages to.
   */
  send(data, to) {
    const addSender = () => data.from = this.eventName
    const encryptIfSynced = () => data = (this.synced) ? aes.encrypt(data, this.key) : data

    if (typeof data !== 'object') {
      throw new Error('Payloads must be objects')
    }

    addSender()
    encryptIfSynced()

    this.dispatch(JSON.stringify(data), to)
  }

  /**
   * Sync handler, binds a callback function that is called when the stream syncs with another.
   * @param {Function} cb - A callback function to be called upon sync
   */
  onSync(cb) {
    this.syncFn = cb
  }

  /**
   * Call to sync this stream with another using a randomized key which is used for encryption.
   * @param {String} to - The other stream's name.
   * @param {String} handshake - The key to encrypt with.
   */
  sync(to, handshake) {
    this.send({
      handshake,
      type: 'sync'
    }, to)
  }

  /**
   * Handles syncing and acking of stream pairs.
   */
  listenForSync() {
    document.addEventListener(this.eventName, (event) => {
      let msg = JSON.parse(event.detail)

      if(!msg.hasOwnProperty('type')) {
        return false
      }

      if(msg.type === 'sync') {
        this.ackSync(msg)
      }

      if(msg.type === 'synced') {
        this.synced = true
      }
    })
  }

  // Helper methods for building and sending events.
  dispatch(encryptedData, to) {
    document.dispatchEvent(this.getEvent(encryptedData, to))
  }

  getEvent(encryptedData, to) {
    return new CustomEvent(to, this.getEventInit(encryptedData))
  }

  getEventInit(encryptedData) {
    return {
      detail: encryptedData
    }
  }
}
