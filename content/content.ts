import { inject } from "./inject";
import { ContentTabStream } from "./stream";

export async function startBrowserContent() {
  ContentTabStream.startStream();
  // inject('injects/zilpay.js');
}
