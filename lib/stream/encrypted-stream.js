import { isUuid } from 'uuidv4'
import { AES } from 'lib/crypto'
import { TypeChecker } from 'lib/type'

const ERRORS_MSGS = {
  isNotUUIDV4: 'uuid must be uuidv4',
  payloadIsNotObject: 'Payloads must be objects'
}
export const TYPES = {
  type: 'type',
  sync: 'sync',
  synced: 'synced'
}
const aes = new AES()

// Helper methods for building and sending events.
/**
 * @param {String} encryptedData - Modifly data before dispatch.
 */
function _getEventInit(encryptedData) {
  return {
    detail: encryptedData
  }
}

/**
 * No modifly data
 * @param {String} encryptedData - No modifly data
 * @param {String} to - Event name.
 */
function _getEvent(encryptedData, to) {
  return new CustomEvent(to, _getEventInit(encryptedData))
}

function _dispatch(encryptedData, to) {
  document.dispatchEvent(_getEvent(encryptedData, to))
}

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
  constructor(eventName, uuidv4) {
    if (!isUuid(uuidv4)) {
      throw new Error(ERRORS_MSGS.isNotUUIDV4)
    }

    this._eventName = eventName
    this._key = uuidv4

    this.synced = false
    this.syncFn = null

    this.listenForSync()
  }

  /**
   * Message listener that returns decrypted messages when synced
   * @param {Function} cb - A message handler method.
   */
  listenWith(cb) {
    document.addEventListener(this._eventName, (event) => {
      if(!this.synced) {
        return false
      }

      let msg = JSON.parse(event.detail)

      if (this.synced || new TypeChecker(msg).isString) {
        msg = aes.decrypt(msg, this._key)
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
    if (!new TypeChecker(data).isObject) {
      throw new Error(ERRORS_MSGS.payloadIsNotObject)
    }

    data.from = this._eventName

    if (this.synced) {
      data = aes.encrypt(data, this._key)
    }

    _dispatch(JSON.stringify(data), to)
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
      type: TYPES.sync
    }, to)
  }

  /**
   * Handles syncing and acking of stream pairs.
   */
  listenForSync() {
    document.addEventListener(this._eventName, (event) => {
      let msg = JSON.parse(event.detail)

      if(!msg.hasOwnProperty(TYPES.type)) {
        return false
      }

      if(msg.type === TYPES.sync) {
        this.ackSync(msg)
      }

      if(msg.type === TYPES.synced) {
        this.synced = true
      }
    })
  }

  /**
   * Gets called when this stream receives a 'sync' messages.
   * @param {Object} msg - The sync message.
   */
  ackSync(msg) {
    this.send({
      type: TYPES.synced
    }, msg.from)

    this._key = msg.handshake

    this.synced = true

    this.syncFn()
  }
}
