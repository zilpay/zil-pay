import { startBackground } from "background/background";
import { GlobalState } from "background/state";
import { Common } from "config/common";
import { Runtime } from "lib/runtime";

Runtime.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === Runtime.runtime.OnInstalledReason.INSTALL) {
    const startPageUrl = Runtime.runtime.getURL(Common.PROMT_PAGE);
    Runtime.tabs.create({ url: startPageUrl });
  }
});

(function () {
  const state = GlobalState.fromStorage();

  startBackground(state);
})();
