import { NetworkControl } from './services/network';
import { AuthGuard } from './services/guard';
import { PromptService } from './services/popup';

const net = new NetworkControl();

import { BrowserStorage, buildObject } from 'lib/storage';

window['BrowserStorage'] = BrowserStorage;
window['buildObject'] = buildObject;
window['netwrok'] = net;
window['guard'] = new AuthGuard();
window['popup'] = new PromptService();
