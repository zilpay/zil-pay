import { Zilliqa } from '@zilliqa-js/zilliqa'

export class BlockChainControll extends Zilliqa {

  constructor(provider) {
    super(provider);
  }

  async getBalance(address) {
    let { result } = this.blockchain.getBalance(address);
    let nonce = 0;

    if (!result) {
      result = 0;
    } else {
      result = result.balance;
      nonce = result ? result.nonce : 0;
    }

    return { result, nonce };
  }

}