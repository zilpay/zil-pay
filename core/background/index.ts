import { NetworkControl } from './services/network';
import { AuthGuard } from './services/guard';
import { PromptService } from './services/popup';
import { NotificationsControl } from './services/notifications';
import { BrowserStorage, buildObject } from 'lib/storage';
import { ZilliqaControl } from './services/blockchain/zilliqa';
import { UnstoppableDomains } from './services/domain-resolve';
// import { startBackground } from './background';

window['BrowserStorage'] = BrowserStorage;
window['buildObject'] = buildObject;
window['netwrok'] = new NetworkControl();
window['guard'] = new AuthGuard();
window['popup'] = new PromptService();
window['notificationsControl'] = new NotificationsControl(
  'https://github.com/zilpay/zil-pay/blob/84d770dbaec813cd6e14b8b449316f6c138a3a47/packages/background/controllers/transaction.js',
  'test',
  'ZIlpay message'
);
window['zilliqaControl'] = new ZilliqaControl(window['netwrok']);
window['domain'] = new UnstoppableDomains();

// startBackground();
