/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { ZILLIQA, DEFAULT } from 'config'
import extension from 'extensionizer'

import namehash from '@unstoppabledomains/resolution/build/zns/namehash'
import { ZilliqaControl } from 'packages/background/services/blockchain'

const { UD_CONTRACT_ADDRESS } = DEFAULT
const { PROVIDER } = ZILLIQA.mainnet
const PINTA = 'https://gateway.pinata.cloud/ipfs'
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

const field = 'records'

/**
 * Unstoppabledomains service domain resolver.
 * [more info](http://unstoppabledomains.com/)
 */
export class UnstoppableDomains {

  constructor() {
    this.zilliqa = new ZilliqaControl(PROVIDER)
  }

  async getAddressByDomain(domain) {
    const domainHash = namehash(domain)
    const zilRecords = 'crypto.ZIL.address'
    const { records } = await this.zilliqa.getSmartContractSubState(
      UD_CONTRACT_ADDRESS,
      field,
      [domainHash]
    )
    const [owner, resolver] = records[domainHash].arguments
    let address = null

    if (resolver && resolver !== ZERO_ADDRESS) {
      const result = await this.zilliqa.getSmartContractSubState(
        resolver,
        field,
        [zilRecords]
      )

      if (result && result[field][zilRecords]) {
        address = result[field][zilRecords]
      }
    }

    return {
      records,
      owner,
      address,
      domainHash,
      domain
    }
  }

  async resolve(domain) {
    const domainHash = namehash(domain)
    const { records } = await this.zilliqa.getSmartContractSubState(
      UD_CONTRACT_ADDRESS,
      field,
      [domainHash]
    )

    try {
      const [owner, resolver] = records[domainHash].arguments

      if (!owner || !resolver || resolver === ZERO_ADDRESS) {
        return null
      }

      const result = await this.zilliqa.getSmartContractSubState(
        resolver,
        field
      )

      return result[field]
    } catch (err) {
      return null
    }
  }

  subcribe() {
    extension.webRequest.onErrorOccurred.removeListener()
    extension.webRequest.onErrorOccurred.addListener(
      async(details) => {
        const ipfs = 'ipfs.html.value'
        const { tabId, url } = details
        // ignore requests that are not associated with tabs
        // only attempt ZNS resolution on mainnet
        if (tabId === -1) {
          return null
        }

        const { hostname } = new URL(url)
        const resolver = await this.resolve(hostname)

        if (resolver[ipfs]) {
          const url = `${PINTA}/${resolver[ipfs]}`

          return extension.tabs.update(tabId, { url })
        }

        return {
          redirectUrl: 'http://dragoneth.com/'
        }
      },
      {
        urls: ['<all_urls>'],
        types: ['main_frame']
      }
    )
  }

}
