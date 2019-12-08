/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { ZILLIQA, DEFAULT } from 'config'

import namehash from 'namicorn/lib/zns/namehash'
import { Zilliqa } from '@zilliqa-js/zilliqa'

const { UD_CONTRACT_ADDRESS } = DEFAULT
const { PROVIDER } = ZILLIQA.mainnet

/**
 * Unstoppabledomains service domain resolver.
 * [more info](http://unstoppabledomains.com/)
 */
export class UnstoppableDomains {

  constructor() {
    this.zilliqa = new Zilliqa(PROVIDER)
    this.contract = this.zilliqa.contracts.at(UD_CONTRACT_ADDRESS)
  }

  async getAddressByDomain(domain) {
    const domainHash = namehash(domain)
    const result = await this
      .contract
      .getSubState('records', [domainHash])
    const { records } = result
    const [owner] = records[domainHash].arguments

    return {
      records,
      owner,
      domainHash,
      domain
    }
  }

}
