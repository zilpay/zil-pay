import { ZIlPayBackground } from 'core/background/wallet/bg-zilpay';
import { startBackground } from './background';
// import { testFromOld } from './test';

(async function() {
  const core = new ZIlPayBackground();

  await core.sync();

  startBackground(core);

  // testFromOld(core);
}());
