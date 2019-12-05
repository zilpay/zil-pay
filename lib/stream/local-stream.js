import extension from 'extensionizer'

/**
 * Un-encrypted stream used to communicate between an extensions popup script and background script.
 */
export class LocalStream {

  /**
   * Sends a message to the background script
   * @param {Object, String, Array} msg - Payload for send. 
   * @returns {Promise<T>} - Responds with the message from the `watch` method's sendResponse parameter.
   */
  static send(msg) {
    return new Promise(resolve => {
      return extension
        .runtime
        .sendMessage(msg, res => resolve(res))
    })
  }

  /**
   * Watches for messages from the background script.
   * @param {Function} callback - A message parsing function.
   */
  static watch(cb) {
    extension
      .runtime
      .onMessage
      .addListener((req, sender, sendResponse) => {
        if(sender.id !== extension.runtime.id) {
          return null
        }

        cb(req, sendResponse)

        return true
      })
  }
}
