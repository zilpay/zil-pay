import TransportWebHID from '@ledgerhq/hw-transport-webhid'
import { fromBech32Address } from '@zilliqa-js/crypto/dist/bech32'
import { LedgerControll } from '@/utils'
import { HW_VARIANTS, LEDGER_USB_VENDOR_ID } from '@/config'
import { Background } from './background'
import { LedgerHit } from '@/utils/ledger-interface'

const { window } = global
const ledgerControll = new LedgerControll()

export async function getHidTransport() {
  let devices = []
  devices = await window.navigator.hid.getDevices({
    filters: [{ vendorId: LEDGER_USB_VENDOR_ID }]
  })
  if (devices.length === 0) {
    devices = await window.navigator.hid.requestDevice({
      filters: [{ vendorId: LEDGER_USB_VENDOR_ID }]
    })
  }
  const userApprovedWebHidConnection = devices.some(
    (device) => device.vendorId === Number(LEDGER_USB_VENDOR_ID),
  )
  if (!userApprovedWebHidConnection) {
    this.ledger.error = 'ledgerWebHIDNotConnectedError'
  }
  if (window['TransportWebHID']) {
    return window['TransportWebHID']
  }
  window['TransportWebHID'] = await TransportWebHID.create()
  return window['TransportWebHID']
}

export async function ledgerImportAccount(index) {
  const isHid = await TransportWebHID.isSupported()
  let payload = {}

  if (isHid) {
    const transport = await getHidTransport()
    const ledger = new LedgerHit(transport)
    payload = await ledger.getPublicAddress(0)
  } else {
    payload = await ledgerControll.getAddresses(index)
  }

  return {
    index,
    balance: '0',
    address: fromBech32Address(payload.pubAddr),
    hwType: HW_VARIANTS.ledger,
    pubKey: payload.publicKey
  }
}

export async function ledgerSendTransaction(index, payload) {
  const isHid = await TransportWebHID.isSupported()
  let signature = ''
  const bg = new Background()
  const txParams = await bg.buildTxParams(payload)

  if (isHid) {
    const transport = await getHidTransport()
    const ledger = new LedgerHit(transport)
    signature = await ledger.signTxn(index, txParams)
  } else {
    signature = await ledgerControll.sendTransaction(index, txParams)
  }

  txParams.signature = signature
  txParams.amount = String(txParams.amount)
  txParams.gasLimit = String(txParams.gasLimit)
  txParams.gasPrice = String(txParams.gasPrice)

  return txParams
}

export function ledgerSignMessage(index, message) {
  return ledgerControll.signMessage(index, message)
}
