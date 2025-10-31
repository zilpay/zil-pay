import { Message } from "lib/streem/message";
import { injectBySlip44 } from "./inject";
import { ContentTabStream } from "./stream";
import { MTypePopup } from "config/stream";
import type { SendResponseParams } from "lib/streem";

export async function startBrowserContent() {
  new ContentTabStream();
  const result = await Message.signal<SendResponseParams>(
    MTypePopup.WEB3_GET_SLIP44,
  ).send();

  injectBySlip44(Number(result.resolve));
}
