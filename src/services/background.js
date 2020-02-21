import { Message, MTypePopup } from 'lib/stream'

const { Promise, window } = global
const BG_ERROR = 'Background script is not loaded.'

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
      throw new Error(BG_ERROR)
    } else if (data.reject) {
      return Promise.reject(data.reject)
    }

    return data.resolve
  }

  /**
   * Generate mnemonic seed words.
   * @returns Promise<string> Random mnemonic seed words.
   */
  async getRandomMnemonic() {
    const randomMnemonic = await Message.signal(
      MTypePopup.GET_RANDOM_SEED
    ).send()

    if (!randomMnemonic) {
      throw new Error(BG_ERROR)
    } else if (randomMnemonic.reject) {
      return Promise.reject(randomMnemonic.reject)
    }

    return randomMnemonic.resolve
  }

  /**
   * Log out set isEnable to false.
   */
  async logOut() {
    Message.signal(MTypePopup.LOG_OUT).send()
    window.close()
  }

  /**
   * Create and encrypt new wallet.
   * @param {Object} payload mnemonic and password.
   */
  async createWallet(payload) {
    if (!payload || !payload.seed || !payload.password) {
      throw new Error('seed, password is required')
    }

    const type = MTypePopup.SET_SEED_AND_PASSWORD
    const wallet = await new Message({ type, payload }).send()

    if (!wallet) {
      throw new Error(BG_ERROR)
    } else if (wallet.reject) {
      return Promise.reject(wallet.reject)
    }

    return wallet.resolve
  }
}
