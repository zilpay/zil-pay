import { mount } from "svelte";
import App from "./App.svelte";
import { getGlobalState } from "./background/wallet";
import { get } from "svelte/store";
import globalStore from 'popup/store/global';
import { Runtime } from "lib/runtime";
import { Common } from "config/common";

let app = {};

function firstLaunch() {
  const state = get(globalStore);

  if (state.wallets.length === 0) {
    const extensionPageUrl = Runtime.runtime.getURL(Common.PROMT_PAGE);

    Runtime.tabs.query({ url: extensionPageUrl }, (tabs) => {
      if (tabs && tabs.length === 0) {
        const startUrl = Runtime.runtime.getURL(Common.PROMT_PAGE);
        Runtime.tabs.create({ url: startUrl });

        window.close();
      } else if (tabs && tabs.length > 0) {
        Runtime.windows.update(tabs[0].windowId, { focused: true });

        if (tabs[0] && tabs[0].id) {
          Runtime.tabs.update(tabs[0].id, { active: true });
        }
      }
    });
  }
}

getGlobalState().finally(() => {
  app = mount(App, {
    target: document.body,
  });

  firstLaunch();
});

export default app;
