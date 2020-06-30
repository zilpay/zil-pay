import { Message, MTypePopup, MTypeTab } from 'lib/stream'
import { toAddress } from '@/filters'
import { ADDRESS_FORMAT_VARIANTS } from '@/config'

const { window, Promise } = global
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
      throw new Error(wallet.reject)
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

    if (!result) {
      throw new Error(BG_ERROR)
    } else if (result.reject) {
      throw new Error(result.reject)
    }

    return result.resolve
  }

  /**
  * Send to background for sign some message.
  * @param {Object} payload message params.
  */
  async sendForConfirmMessage(payload) {
    const type = MTypePopup.CONFIRM_SIGN_MSG
    const result = await new Message({ type, payload }).send()

    if (!result) {
      throw new Error(BG_ERROR)
    } else if (result.reject) {
      throw new Error(result.reject)
    }

    return result.resolve
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

  /**
   * Use for Import by keystore file.
   * @param {Object} payload KeyStore payload.
   */
  async importKeystore(payload) {
    const type = MTypePopup.IMPORT_KEYSTORE
    const result = await new Message({ type, payload }).send()

    if (!result) {
      throw new Error(BG_ERROR)
    } else if (result.reject) {
      throw new Error(result.reject)
    }

    return result.resolve
  }

  /**
   * Rejected need to confirm tx and send to tabs.
   */
  async rejectTx() {
    return Message.signal(MTypePopup.REJECT_CONFIRM_TX).send()
  }

  /**
   * Send to tab information about app access.
   * @param {Boolean} confirm
   */
  async sendResponseConnection(confirm, uuid) {
    const type = MTypeTab.RESPONSE_TO_DAPP
    const payload = { confirm, uuid }

    return new Message({ type, payload }).send()
  }

  /**
   * Build non sign txParams for sign via HW wallet.
   * @param {Object} payload
   */
  async buildTxParams(payload) {
    const type = MTypePopup.BUILD_TX_PARAMS
    const result = await new Message({ type, payload }).send()

    if (!result) {
      throw new Error(BG_ERROR)
    } else if (result.reject) {
      throw new Error(result.reject)
    }

    return result.resolve
  }

  /**
   * Search address via ZNC service.
   * @param {String} domain For example zilpay.zil
   */
  async getZNSAddress(domain) {
    const type = MTypePopup.DOMAIN_RESOLVE
    const payload = { domain }
    const result = await new Message({ type, payload }).send()

    if (!result) {
      throw new Error(BG_ERROR)
    } else if (result.reject) {
      throw new Error(result.reject)
    }

    return toAddress(result.resolve.owner, ADDRESS_FORMAT_VARIANTS.bech32, false)
  }

  /**
   * Get the token information by contract address.
   * @param {String} address - Contract address.
   */
  async getTokenInfo(address) {
    const type = MTypePopup.GET_TOKEN_INFO
    const payload = { address }
    const result = await new Message({ type, payload }).send()

    if (!result) {
      throw new Error(BG_ERROR)
    } else if (result.reject) {
      throw new Error(result.reject)
    }

    return result.resolve
  }

  /**
   * Write to storage new token.
   * @param {String} address - contract address of token.
   */
  async setToken(address) {
    const type = MTypePopup.SET_TOKEN
    const payload = { address }
    const result = await new Message({ type, payload }).send()

    if (!result) {
      throw new Error(BG_ERROR)
    } else if (result.reject) {
      throw new Error(result.reject)
    }

    return result.resolve
  }

  async toDefaultCoinsList() {
    const type = MTypePopup.INIT_TOKEN
    const result = await Message.signal(type).send()

    if (!result) {
      throw new Error(BG_ERROR)
    } else if (result.reject) {
      throw new Error(result.reject)
    }

    return result.resolve
  }
}
