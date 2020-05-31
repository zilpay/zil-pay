import { fromBech32Address } from '@zilliqa-js/crypto/dist/bech32'
import { LedgerControll } from '@/utils'
import { HW_VARIANTS } from '@/config'
import { Background } from './background'

const ledgerControll = new LedgerControll()

export async function ledgerImportAccount(index) {
  const payload = await ledgerControll.getAddresses(index)

  return {
    index,
    balance: '0',
    address: fromBech32Address(payload.pubAddr),
    hwType: HW_VARIANTS.ledger,
    pubKey: payload.publicKey
  }
}

export async function ledgerSendTransaction(index, payload) {
  const bg = new Background()
  const txParams = await bg.buildTxParams(payload)

  txParams.signature = await ledgerControll.sendTransaction(index, txParams)

  return {
    ...payload,
    ...txParams
  }
}

export function ledgerSignMessage(index, message) {
  return ledgerControll.signMessage(index, message)
}
