import { NetworkControl } from './services/network';
import { AuthGuard } from './services/guard';

const net = new NetworkControl();

import { BrowserStorage, buildObject } from 'lib/storage';

window['BrowserStorage'] = BrowserStorage;
window['buildObject'] = buildObject;
window['netwrok'] = net;
window['guard'] = new AuthGuard();
