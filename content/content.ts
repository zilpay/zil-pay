import { injectBySlip44 } from "./inject";
import { ContentTabStream } from "./stream";
import { ETHEREUM, ZILLIQA } from "config/slip44";

export function startBrowserContent() {
  new ContentTabStream();
  // const result = await Message.signal<SendResponseParams<number[]>>(
  //   MTypePopup.WEB3_GET_SLIP44,
  // ).send();

  injectBySlip44([ETHEREUM, ZILLIQA]);
  // injectBySlip44(result.resolve);
}
