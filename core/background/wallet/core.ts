/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import { NetworkControl } from 'core/background/services/network';
import { AuthGuard } from 'core/background/services/guard';
import { PromptService } from 'core/background/services/popup';
import { ZilliqaControl } from 'core/background/services/blockchain/zilliqa';
import { UnstoppableDomains } from 'core/background/services/domain-resolve';
import { ZRC2Controller } from 'core/background/services/token';
import { AccountController } from 'core/background/services/account/account';
import { BlockController } from 'core/background/services/worker';
import { RateController, CurrenciesController } from 'core/background/services/currency';
import { ThemeController } from 'core/background/services/theme';
import { SSnController } from 'core/background/services/ssn';
import { AppConnectController } from 'core/background/services/app-connect';
import { ContactController } from 'core/background/services/contacts';
import { GasController } from 'core/background/services/gas';
import { TransactionsController } from 'core/background/services/transactions';
import { NonceController } from 'core/background/services/nonce';
import { TransactionsQueue } from 'core/background/services/transactions';

export class ZIlPayCore {
  public readonly netwrok = new NetworkControl();
  public readonly guard = new AuthGuard();
  public readonly ud = new UnstoppableDomains();
  public readonly prompt = new PromptService();
  public readonly rate = new RateController();
  public readonly theme = new ThemeController();
  public readonly apps = new AppConnectController();
  public readonly currencies = new CurrenciesController();
  public readonly contacts = new ContactController();
  public readonly zilliqa = new ZilliqaControl(this.netwrok);
  public readonly gas = new GasController(this.zilliqa);
  public readonly account = new AccountController(this.guard);
  public readonly transactions = new TransactionsController(this.netwrok, this.account);
  public readonly zrc2 = new ZRC2Controller(this.netwrok, this.zilliqa, this.account);
  public readonly ssn = new SSnController(this.zilliqa, this.netwrok);
  public readonly nonceCounter = new NonceController(this.zilliqa, this.transactions);
  public readonly transactionsQueue = new TransactionsQueue(this.zilliqa, this.netwrok, this.transactions);
  public readonly blockchain = new BlockController(this.zilliqa, this.transactionsQueue);

  public get state() {
    return {
      wallet: this.account.wallet,
      netwrok: {
        config: this.netwrok.config,
        selected: this.netwrok.selected
      },
      theme: this.theme,
      guard: {
        isReady: this.guard.isReady,
        isEnable: this.guard.isEnable
      },
      rate: this.rate.rate,
      apps: {
        confirmApp: this.apps.confirmApp,
        connections: this.apps.connections
      },
      currency: this.currencies.selected,
      contacts: this.contacts.contacts,
      gas: {
        gasLimit: this.gas.gasLimit,
        gasPrice: this.gas.gasPrice
      },
      transactions: {
        forConfirm: this.transactions.forConfirm,
        transactions: this.transactions.transactions
      },
      zrc2: this.zrc2.identities,
      blocknumber: this.blockchain.blocknumber,
      ssn: this.ssn.payload
    };
  }
}
