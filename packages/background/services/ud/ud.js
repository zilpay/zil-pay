/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { ZILLIQA, DEFAULT } from 'config'

import namehash from '@unstoppabledomains/resolution/build/zns/namehash'
import { ZilliqaControl } from 'packages/background/services/blockchain'

const { UD_CONTRACT_ADDRESS } = DEFAULT
const { PROVIDER } = ZILLIQA.mainnet
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

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
    const field = 'records'
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

}
