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

  async singCreateTransaction(txData, seed, index, msgId) {
    this.wallet.addByMnemonic(seed, index);
    const pubKey = this.wallet.defaultAccount.publicKey;
    let {
      amount,
      code,
      data,
      gasLimit,
      gasPrice,
      toAddr,
      nonce,
      version
    } = txData;

    if (!version) {
      version = await this.version(msgId);
    }
    if (!nonce && nonce != 0) {
      const balance = await this.getBalance(
        this.wallet.defaultAccount.address
      );
      nonce = balance.nonce;
    }

    amount = new BN(amount);
    gasPrice = new BN(gasPrice);
    gasLimit = Long.fromNumber(gasLimit);
    
    nonce++;

    const zilTxData = this.transactions.new({
      nonce,
      gasPrice,
      amount,
      gasLimit,
      version,
      toAddr,
      pubKey,
      code,
      data
    });
    const { txParams } = await this.wallet.sign(zilTxData);
    return await this.provider.send(
      RPCMethod.CreateTransaction, txParams
    );
  }

  async version(msgVerison=1) {
    const { result } = await this.network.GetNetworkId();
    return bytes.pack(result, msgVerison);
  }

  async getAccountBySeed(seed, index) {
    this.wallet.addByMnemonic(seed, index);
    const { address, publicKey } = this.wallet.defaultAccount;
    const { result } = await this.getBalance(address);

    return {
      index, publicKey, address,
      balance: result
    };
  }

}