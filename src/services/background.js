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

    if (wallet.reject) {
      return Promise.reject(wallet.reject)
    }
  }

  /**
   * Authorization via password.
   * @param {String} password.
   */
  async unlockWallet(password) {
    const type = MTypePopup.SET_PASSWORD
    const payload = { password }
    const status = await new Message({ type, payload }).send()

    if (!status.resolve) {
      throw new Error(status.resolve)
    }

    return status.resolve
  }

  /**
   * Updated current account balance.
   */
  async balanceUpdate() {
    const result = await Message.signal(
      MTypePopup.UPDATE_BALANCE
    ).send()

    if (!result) {
      throw new Error(BG_ERROR)
    } else if (result.reject) {
      throw new Error(result.reject)
    }

    return result.resolve
  }

  /**
   * Created account via seed phrase.
   */
  async createAccount() {
    const result = await Message.signal(
      MTypePopup.CREATE_ACCOUNT_BY_SEED
    ).send()

    if (!result) {
      throw new Error(BG_ERROR)
    } else if (result.reject) {
      throw new Error(result.reject)
    }

    return result.resolve
  }

  /**
   * Send tx payload for sign and send to node.
   * @param {Object} payload TxPartams.
   */
  async sendToSignBroadcasting(payload) {
    const type = MTypePopup.SIGN_AND_SEND
    const result = await new Message({ type, payload }).send()

    console.log(result)
  }

  /**
   * Decrypt vault and responce first seed phase.
   * @param {String} password Unlock password.
   */
  async exportSeed(password) {
    const type = MTypePopup.EXPORT_SEED
    const payload = { password }
    const result = await new Message({ type, payload }).send()

    if (!result) {
      throw new Error(BG_ERROR)
    } else if (result.reject) {
      throw new Error(result.reject)
    }

    return result.resolve
  }

  /**
   * Decrypt vault and responce privateKey for selected account.
   * @param {String} password Unlock password.
   */
  async exportPrivKey(password) {
    const type = MTypePopup.EXPORT_PRIVATE_KEY
    const payload = { password }
    const result = await new Message({ type, payload }).send()

    if (!result) {
      throw new Error(BG_ERROR)
    } else if (result.reject) {
      throw new Error(result.reject)
    }

    return result.resolve
  }

  /**
   * Import account via privateKey.
   * @param {String} privKey ByteStr32 in Hex.
   */
  async importPrivKey(privKey) {
    const type = MTypePopup.IMPORT_PRIVATE_KEY
    const payload = { privKey }
    const result = await new Message({ type, payload }).send()

    if (!result) {
      throw new Error(BG_ERROR)
    } else if (result.reject) {
      throw new Error(result.reject)
    }

    return result.resolve
  }
}
