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
  protected readonly _netwrok = new NetworkControl();
  protected readonly _guard = new AuthGuard();
  protected readonly _ud = new UnstoppableDomains();
  protected readonly _prompt = new PromptService();
  protected readonly _rate = new RateController();
  protected readonly _theme = new ThemeController();
  protected readonly _currencies = new CurrenciesController();
  protected readonly _zilliqa = new ZilliqaControl(this._netwrok);
  protected readonly _account = new AccountController(this._zilliqa, this._guard);
  protected readonly _zrc2 = new ZRC2Controller(this._netwrok, this._zilliqa, this._account);
  protected readonly _blockchain = new BlockController(this._zilliqa);
  protected readonly _ssn = new SSnController(this._zilliqa, this._netwrok);
}
