import { ZIlPayBackground } from 'core/background/wallet/bg-zilpay';
// import { NotificationsControl } from './services/notifications';
import { testFromOld } from './test';

(async function() {
  const core = new ZIlPayBackground();

  // await core.sync();
  testFromOld(core);
  // TODO: add notificationsCounter.
  // https://github.com/zilpay/zil-pay/blob/84d770dbaec813cd6e14b8b449316f6c138a3a47/packages/background/services/blockchain/zilliqa.js#L533
}());

// import { NetworkControl } from './services/network';
// import { AuthGuard } from './services/guard';
// import { PromptService } from './services/popup';
// import { NotificationsControl } from './services/notifications';
// import { BrowserStorage, buildObject } from 'lib/storage';
// import { ZilliqaControl } from './services/blockchain/zilliqa';
// import { UnstoppableDomains } from './services/domain-resolve';
// import { ZRC2Controller } from 'core/background/services/token';
// // import { startBackground } from './background';
// import { AccountController } from './services/account/account';
// import { BlockController } from './services/worker';
// import { RateController, CurrenciesController } from './services/currency';
// import { ThemeController } from './services/theme';
// import { SSnController } from './services/ssn';

// window['BrowserStorage'] = BrowserStorage;
// window['buildObject'] = buildObject;
// window['netwrok'] = new NetworkControl();
// window['guard'] = new AuthGuard();
// window['popup'] = new PromptService();
// window['notificationsControl'] = new NotificationsControl(
//   'https://github.com/zilpay/zil-pay/blob/84d770dbaec813cd6e14b8b449316f6c138a3a47/packages/background/controllers/transaction.js',
//   'test',
//   'ZIlpay message'
// );
// window['zilliqaControl'] = new ZilliqaControl(window['netwrok']);
// window['domain'] = new UnstoppableDomains();
// window['account'] = new AccountController(window['zilliqaControl'], window['guard']);
// window['zrc2'] = new ZRC2Controller(window['netwrok'], window['zilliqaControl'], window['account']);
// window['block'] = new BlockController(window['zilliqaControl']);
// window['rate'] = new RateController();
// window['currencies'] = new CurrenciesController();
// window['theme'] = new ThemeController();
// window['ssn'] = new SSnController(window['zilliqaControl'], window['netwrok']);
// // startBackground();
