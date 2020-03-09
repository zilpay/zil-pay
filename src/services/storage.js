import { FIELDS, ZILLIQA } from 'config'
import { BrowserStorage, BuildObject } from 'lib/storage'
import { TypeChecker } from 'lib/type'

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
  if (!wallet.identities || wallet.identities.lenght < 1) {
    return null
  } else if (!new TypeChecker(wallet.selectedAddress).isInt) {
    return null
  }

  await storage.set([
    new BuildObject(FIELDS.WALLET, wallet)
  ])

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

  await storage.set([
    new BuildObject(FIELDS.CONFIG, config)
  ])
}

export async function changeTheme(theme) {
  if (!new TypeChecker(theme).isString) {
    throw new Error('theme param must be string.')
  }

  await storage.set([
    new BuildObject(FIELDS.THEME, theme)
  ])
}
