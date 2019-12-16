import namehash from 'namicorn/build/zns/namehash'
import { Zilliqa } from '@zilliqa-js/zilliqa'
import API from '../../../../config/api'
import ZIL from '../../../../config/zil'

const { UD_CONTRACT_ADDRESS } = API;
const { PROVIDER } = ZIL.mainnet;

export class UnstoppableDomains {

  constructor() {
    this.zilliqa = new Zilliqa(PROVIDER);
    this.contract = this.zilliqa.contracts.at(UD_CONTRACT_ADDRESS);
  }

  async getAddressByDomain(domain) {
    const domainHash = namehash(domain);
    const result = await this
      .contract
      .getSubState('records', [domainHash]);
    const { records } = result;
    const [owner] = records[domainHash].arguments;

    return {
      records,
      owner,
      domainHash,
      domain
    };
  }

}
