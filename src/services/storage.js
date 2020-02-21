import { FIELDS } from 'config'
import { BrowserStorage, BuildObject } from 'lib/storage'

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
