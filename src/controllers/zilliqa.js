import { Zilliqa } from '@zilliqa-js/zilliqa'
import { RPCMethod } from '@zilliqa-js/core'
import { units, Long, BN, bytes } from '@zilliqa-js/util'

export class BlockChainControll extends Zilliqa {

  constructor(provider) {
    super(provider);
  }

  async getBalance(address) {
    let { result } = await this.blockchain.getBalance(address);
    let nonce = 0;

    if (!result) {
      result = 0;
    } else {
      nonce = result ? result.nonce : 0;
      result = result.balance;
    }

    return { result, nonce };
  }

  async signSendTransaction(data, seed, index, msgId) {
    this.wallet.addByMnemonic(seed, index);
    const version = await this.version(msgId);
    const gasLimit = Long.fromNumber(1);
    const gasPrice = units.toQa(data.gasPrice, units.Units.Zil);
    const amount = new BN(units.toQa(data.amount, units.Units.Zil));
    const balance = await this.getBalance(
      this.wallet.defaultAccount.address
    );
    const nonce = balance.nonce + 1;
    const zilTxData = this.transactions.new({
      nonce, gasPrice, amount, gasLimit, version,
      toAddr: data.to,
      pubKey: this.wallet.defaultAccount.publicKey
    });
    const { txParams } = await this.wallet.sign(zilTxData);
    const txSent = await this.provider.send(
      RPCMethod.CreateTransaction, txParams
    );
    return {
      nonce,
      gasLimit: gasLimit.toString(),
      gasPrice: gasPrice.toString(),
      amount: txParams.amount.toString(),
      toAddr: data.to,
      id: txSent.result.TranID,
      info: txSent.result.Info,
      from: this.wallet.defaultAccount.address
    };
  }

  async version(msgVerison=1) {
    const { result } = await this.network.GetNetworkId();
    return bytes.pack(result, msgVerison);
  }

}