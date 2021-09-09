import { NetworkControl } from './services/network';

const net = new NetworkControl();

import { BrowserStorage, buildObject } from 'lib/storage';

window['BrowserStorage'] = BrowserStorage;
window['buildObject'] = buildObject;
window['netwrok'] = net;
