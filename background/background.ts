import { MTypePopup } from "config/stream";
import type { GlobalState } from "./state";
import { Runtime } from "lib/runtime";

export function startBackground(core: GlobalState) {
  Runtime.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (sender.id !== Runtime.runtime.id) {
      sendResponse(null);
      return true;
    }

    switch (msg.type) {
      case MTypePopup.GET_GLOBAL_STATE:
        core.wallet.getGlobalState(sendResponse);
        return true;
      default:
        sendResponse(null);
        return true;
    }
  });
}
