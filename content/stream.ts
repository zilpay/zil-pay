import { Runtime } from "lib/runtime";
import {
    LegacyZilliqaTabMsg,
  MTypeTabContent,
  type SendResponseParams,
} from "lib/streem";
import { Message, type ReqBody } from "lib/streem/message";
import { TabStream } from "lib/streem/tab-stream";

export class ContentTabStream {
  readonly #stream: TabStream;

  get stream() {
    return this.#stream;
  }

  constructor() {
    Runtime.runtime.onMessage.addListener((req, sender, sendResponse) => {
      if (sender.id !== Runtime.runtime.id) {
        return null;
      }

      console.log(req, sender, sendResponse);

      sendResponse({});
    });

    this.#stream = new TabStream(MTypeTabContent.CONTENT);
    this.#stream.listen((msg) => this.#listener(msg));
  }

  async #listener(msg?: ReqBody) {
    if (!msg) return;

    msg.domain = window.location.hostname;

    switch (msg.type) {
      case LegacyZilliqaTabMsg.CONNECT_APP:
        console.log(msg);
        break;
      case LegacyZilliqaTabMsg.GET_WALLET_DATA:
        const data = await new Message<SendResponseParams<ReqBody>>(msg).send();
        if (data && data.resolve) {
          this.#stream.send({
            type: LegacyZilliqaTabMsg.GET_WALLET_DATA,
            payload: data.resolve,
          }, MTypeTabContent.INJECTED);
        }
        return;
        default:
          break;
    }
  }
}
