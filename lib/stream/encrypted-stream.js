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
    // this.listenForSync()
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

  // send(data, to) {

  // }
}
