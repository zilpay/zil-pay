import { startBackground } from "background/background";
import { GlobalState } from "background/state";
import { Common } from "config/common";
import { Runtime } from "lib/runtime";

(async function () {
  const state = await GlobalState.fromStorage();

  startBackground(state);

  Runtime.runtime.onInstalled.addListener(async (details) => {
    console.log(details);
    if (details.reason === 'install') {
      if (state.state.wallets.length === 0) {
        const startPageUrl = Runtime.runtime.getURL(Common.PROMT_PAGE);
        Runtime.tabs.create({ url: startPageUrl });
      }
    }
  });
})();
