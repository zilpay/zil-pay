import type { GlobalState } from "./state";
import { Runtime } from "lib/runtime";

export function startBackground(core: GlobalState) {
  Runtime.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (sender.id !== Runtime.runtime.id) {
      sendResponse(null);
      return true;
    }

    switch (msg.type) {
      default:
        sendResponse(null);
        return true;
    }
  });
}
