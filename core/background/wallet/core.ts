/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { WalletState } from 'types/account';
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
import { LedgerWebHID } from 'core/background/services/ledger';
import { LocalesController } from 'core/background/services/locale';
import { AddressController } from 'core/background/services/address';

export class ZIlPayCore {
  public netwrok = new NetworkControl();
  public readonly guard = new AuthGuard();
  public ud = new UnstoppableDomains();
  public prompt = new PromptService();
  public rate = new RateController();
  public theme = new ThemeController();
  public locale = new LocalesController();
  public apps = new AppConnectController();
  public currencies = new CurrenciesController();
  public contacts = new ContactController();
  public ledger = new LedgerWebHID();
  public addressFormat = new AddressController();
  public zilliqa = new ZilliqaControl(this.netwrok);
  public gas = new GasController(this.zilliqa);
  public readonly account = new AccountController(this.guard);
  public transactions = new TransactionsController(this.netwrok, this.account);
  public zrc2 = new ZRC2Controller(this.netwrok, this.zilliqa, this.account);
  public ssn = new SSnController(this.zilliqa, this.netwrok);
  public nonceCounter = new NonceController(this.zilliqa, this.transactions);
  public transactionsQueue = new TransactionsQueue(this.zilliqa, this.netwrok, this.transactions);
  public blockchain = new BlockController(this.zilliqa, this.transactionsQueue);

  public get state(): WalletState {
    return {
      popup: this.prompt.enabled,
      wallet: this.account.wallet,
      phishing: this.apps.phishing,
      netwrok: {
        config: this.netwrok.config,
        selected: this.netwrok.selected
      },
      format: this.addressFormat.format,
      lockTime: this.guard.lockTime,
      locale: this.locale.selected,
      theme: this.theme.selected,
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
        gasPrice: this.gas.gasPrice,
        multiplier: this.gas.multiplier
      },
      transactions: {
        forConfirm: this.transactions.forConfirm,
        transactions: this.transactions.transactions,
        message: this.transactions.message
      },
      zrc2: this.zrc2.identities,
      blocknumber: this.blockchain.blocknumber,
      ssn: this.ssn.payload
    };
  }
}
