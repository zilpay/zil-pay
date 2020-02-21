import { Message, MTypePopup } from 'lib/stream'

const { Promise } = global

export class Background {

  /**
   * Get authorization data from background.
   * @returns Promise<{ isEnable:boolean; isReady: boolean; networkStatus: boolean; }>
   */
  async getAuthData() {
    const data = await Message.signal(
      MTypePopup.POPUP_INIT
    ).send()

    if (!data) {
      throw new Error('Background script is not loaded.')
    } else if (data.reject) {
      return Promise.reject(data.reject)
    }

    return Promise.resolve(data.resolve)
  }
}
