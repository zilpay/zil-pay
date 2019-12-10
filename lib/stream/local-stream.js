import extension from 'extensionizer'

/**
 * Un-encrypted stream used to communicate between an extensions popup script and background script.
 */
export class LocalStream {

  /**
   * Watches for messages from the background script.
   * @param {Function} callback - A message parsing function.
   */
  static watch(cb) {
    extension
      .runtime
      .onMessage
      .addListener((req, sender, sendResponse) => {
        if (sender.id !== extension.runtime.id) {
          return null
        }

        cb(req, sendResponse)

        return true
      })
  }
}
