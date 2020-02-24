import { fromBech32Address } from '@zilliqa-js/crypto/dist/bech32'
import { LedgerControll } from '@/utils'

const ledgerControll = new LedgerControll()

export async function ledgerImportAccount(index) {
  const payload = await ledgerControll.getAddresses(index)

  return {
    index,
    balance: '0',
    address: fromBech32Address(payload.pubAddr),
    hwType: 'ledger',
    pubKey: payload.publicKey
  }
}
