import { FIELDS, ZILLIQA } from 'config'
import { Message, MTypePopup } from 'lib/stream'
import { BrowserStorage, BuildObject } from 'lib/storage'
import { TypeChecker } from 'lib/type'
import { Background } from './background'

const storage = new BrowserStorage()

export async function getStorageData() {
  return await storage.get([
    FIELDS.CONFIG,
    FIELDS.WALLET,
    FIELDS.SELECTED_NET,
    FIELDS.TRANSACTIONS,
    FIELDS.CONFIRM_TX,
    FIELDS.CONNECT_DAPP
  ])
}

export async function setSelectedNetwork(selectedNet) {
  if (!(selectedNet in ZILLIQA)) {
    throw new Error('selectedNet must be', Object.keys(ZILLIQA).join(','))
  }

  await storage.set([
    new BuildObject(FIELDS.SELECTED_NET, selectedNet)
  ])

  return selectedNet
}

export async function walletUpdate(wallet) {
  if (!wallet || !wallet.identities || wallet.identities.length === 0) {
    return null
  } else if (!new TypeChecker(wallet.selectedAddress).isInt) {
    return null
  }

  const type = MTypePopup.SET_PROXY_STORAGE
  const payload = new BuildObject(FIELDS.WALLET, wallet)

  await new Message({ type, payload }).send()

  return wallet
}

export async function updateStatic(object, isOverwrite = false) {
  let stateData = await storage.get(FIELDS.STATIC)

  if (new TypeChecker(stateData).isString) {
    // it need for the firefox.
    stateData = JSON.parse(stateData)
  }

  if (!stateData || Object.keys(stateData).length < 3 || isOverwrite) {
    const data = {
      currency: object.currency,
      addressFormat: object.addressFormat,
      defaultGas: object.defaultGas,
      lockTime: object.lockTime,
      dappsList: object.dappsList
    }

    await storage.set(new BuildObject(
      FIELDS.STATIC,
      JSON.stringify(data)
    ))

    return null
  }

  return Object.assign(object, stateData)
}

export async function updateNetworkConifg(config) {
  if (Object.keys(config).length < Object.keys(ZILLIQA).length) {
    throw new Error('Shoud be have ', Object.keys(ZILLIQA).length, 'elements.')
  }

  Object.keys(config).forEach((key) => {
    if (!(key in config)) {
      throw new Error(key, 'is required')
    }
  })

  const type = MTypePopup.SET_PROXY_STORAGE
  const payload = new BuildObject(FIELDS.CONFIG, config)

  await new Message({ type, payload }).send()
}

export async function changeTheme(theme) {
  if (!new TypeChecker(theme).isString) {
    throw new Error('theme param must be string.')
  }

  await storage.set([
    new BuildObject(FIELDS.THEME, theme)
  ])
}

export async function changeContacts(contacts) {
  const type = MTypePopup.SET_PROXY_STORAGE
  const payload = new BuildObject(FIELDS.CONTACTS, contacts)

  await new Message({ type, payload }).send()

  return contacts
}

export function clearTransactionsHistory() {
  return storage.set([
    new BuildObject(FIELDS.TRANSACTIONS, {})
  ])
}

export function getTransactionsHistory() {
  return storage.get(FIELDS.TRANSACTIONS)
}

export function getToConfirmTxs() {
  return storage.get(FIELDS.CONFIRM_TX)
}

export function getConnect() {
  return storage.get(FIELDS.CONNECT_DAPP)
}

export function removeConnect() {
  return storage.set([
    new BuildObject(FIELDS.CONNECT_DAPP, {})
  ])
}

export async function getTokens() {
  const tokensData = await storage.get([
    FIELDS.TOKENS,
    FIELDS.SELECTED_COIN
  ])

  if (!tokensData || !tokensData[FIELDS.TOKENS] || !tokensData[FIELDS.SELECTED_COIN]) {
    const bg = new Background()

    return bg.toDefaultCoinsList()
  }

  return tokensData
}
