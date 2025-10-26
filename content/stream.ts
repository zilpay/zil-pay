import { Runtime } from "lib/runtime";
import {
  MTypeTabContent,
  type SendResponseParams,
} from "lib/streem";
import { Message, type ReqBody } from "lib/streem/message";
import { TabStream } from "lib/streem/tab-stream";

export class ContentTabStream {
  readonly #stream: TabStream;

  static startStream() {
    Runtime.runtime.onMessage.addListener((req, sender, sendResponse) => {
      if (sender.id !== Runtime.runtime.id) {
        return null;
      }

      console.log(req, sender, sendResponse);

      sendResponse({});
    });
  }

  get stream() {
    return this.#stream;
  }

  constructor() {
    this.#stream = new TabStream(MTypeTabContent.CONTENT);
    this.#stream.listen((msg) => this.#listener(msg));
  }

  async #listener(msg?: ReqBody) {
    if (!msg) return;

    msg.domain = window.location.hostname;

    const data = await new Message<SendResponseParams>(msg).send();

    this.#stream.send(data as ReqBody, MTypeTabContent.INJECTED);
  }
}
