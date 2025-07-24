import type { BackgroundState } from "background/storage";
import { MTypePopup } from "config/stream";
import { Themes } from "config/theme";
import { warpMessage } from "lib/popup/warp-message";
import { Message } from "lib/streem/message";
import { themeDetect } from "popup/mixins/theme";

export async function getGlobalState() {
  const data = await Message.signal(MTypePopup.GET_GLOBAL_STATE).send();
  let resolve = warpMessage(data) as BackgroundState;

  if (resolve.appearances == Themes.System) {
    resolve.appearances = themeDetect();
  }

  document.body.setAttribute("theme", resolve.appearances);

  return resolve;
}
