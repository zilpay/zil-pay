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

export class ZIlPayCore {
  public readonly netwrok = new NetworkControl();
  public readonly guard = new AuthGuard();
  public readonly ud = new UnstoppableDomains();
  public readonly prompt = new PromptService();
  public readonly rate = new RateController();
  public readonly theme = new ThemeController();
  public readonly currencies = new CurrenciesController();
  public readonly zilliqa = new ZilliqaControl(this.netwrok);
  public readonly account = new AccountController(this.zilliqa, this.guard);
  public readonly zrc2 = new ZRC2Controller(this.netwrok, this.zilliqa, this.account);
  public readonly blockchain = new BlockController(this.zilliqa);
  public readonly ssn = new SSnController(this.zilliqa, this.netwrok);
}
