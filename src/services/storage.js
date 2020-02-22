import { FIELDS } from 'config'
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

export async function setSelectedNetwork(net) {
  await storage.set([
    new BuildObject(FIELDS.SELECTED_NET, net)
  ])

  return net
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
