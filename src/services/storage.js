import { FIELDS } from 'config'
import { BrowserStorage } from 'lib/storage'

export async function getStorageData() {
  const storage = new BrowserStorage()

  return await storage.get([
    FIELDS.CONFIG,
    FIELDS.WALLET,
    FIELDS.SELECTED_NET,
    FIELDS.TRANSACTIONS,
    FIELDS.CONFIRM_TX,
    FIELDS.CONNECT_DAPP
  ])
}
