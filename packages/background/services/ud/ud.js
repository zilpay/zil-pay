/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { ZILLIQA, DEFAULT } from 'config'

import namehash from 'namicorn/build/zns/namehash'
import { ZilliqaControl } from '../blockchain/zilliqa'

const { UD_CONTRACT_ADDRESS } = DEFAULT
const { PROVIDER } = ZILLIQA.mainnet

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
    const { records } = await this.zilliqa.getSmartContractSubState(
      UD_CONTRACT_ADDRESS,
      'records',
      [domainHash]
    )
    console.log(records)
    const [owner] = records[domainHash].arguments

    return {
      records,
      owner,
      domainHash,
      domain
    }
  }

}
