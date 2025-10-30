import { MTypePopup } from "config/stream";
import { Runtime } from "lib/runtime";
import {
    LegacyZilliqaTabMsg,
  MTypeTabContent,
  type SendResponseParams,
} from "lib/streem";
import { Message, type ReqBody } from "lib/streem/message";
import { TabStream } from "lib/streem/tab-stream";
import { injectBySlip44 } from "./inject";

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
      const msg = req as ReqBody;

      switch (msg.type) {
        case MTypePopup.RESPONSE_TO_DAPP:
          this.#stream.send(msg, MTypeTabContent.INJECTED);
          break;
        case MTypePopup.EVM_RESPONSE:
          this.#stream.send(msg, MTypeTabContent.INJECTED);
          break;
        case MTypePopup.WEB3_GET_SLIP44:
          injectBySlip44(Number(msg.payload));
          break;
        case LegacyZilliqaTabMsg.SING_MESSAGE_RES:
          this.#stream.send(msg, MTypeTabContent.INJECTED);
          break;
        case LegacyZilliqaTabMsg.ADDRESS_CHANGED:
          this.#stream.send(msg, MTypeTabContent.INJECTED);
          break;
        case LegacyZilliqaTabMsg.TX_RESULT:
          this.#stream.send(msg, MTypeTabContent.INJECTED);
          break;
      }

      sendResponse({});
    });

    this.#stream = new TabStream(MTypeTabContent.CONTENT);
    this.#stream.listen((msg) => this.#listener(msg));
  }

  async #listener(msg?: ReqBody) {
    if (!msg) return;

    msg.domain = window.location.hostname;

    console.log(msg);

    switch (msg.type) {
      case MTypePopup.CONNECT_APP:
        await new Message<SendResponseParams<ReqBody>>(msg).send();
        break;
      case MTypePopup.EVM_REQUEST:
        await new Message<SendResponseParams<ReqBody>>(msg).send();
        break;
      case LegacyZilliqaTabMsg.CONTENT_PROXY_MEHTOD:
        const proyxRes = await new Message<SendResponseParams<ReqBody>>(msg).send();
          this.#stream.send({
            type: LegacyZilliqaTabMsg.CONTENT_PROXY_RESULT,
            uuid: msg.uuid,
            payload: proyxRes,
          }, MTypeTabContent.INJECTED);
        break;
      case LegacyZilliqaTabMsg.SIGN_MESSAGE:
        await new Message<SendResponseParams<ReqBody>>(msg).send();
        break;
      case LegacyZilliqaTabMsg.CALL_TO_SIGN_TX:
        await new Message<SendResponseParams<ReqBody>>(msg).send();
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
