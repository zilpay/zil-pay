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
        const connectApp = await new Message<SendResponseParams<ReqBody>>(msg).send();
        this.#stream.sendParams(connectApp, MTypeTabContent.INJECTED);
        break;
      case LegacyZilliqaTabMsg.GET_WALLET_DATA:
        const walltData = await new Message<SendResponseParams<ReqBody>>(msg).send();
        if (walltData && walltData.resolve) {
          this.#stream.send({
            type: LegacyZilliqaTabMsg.GET_WALLET_DATA,
            payload: walltData.resolve,
          }, MTypeTabContent.INJECTED);
        }
        return;
        default:
          break;
    }
  }
}
