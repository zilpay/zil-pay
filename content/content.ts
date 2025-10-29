import { inject } from "./inject";
import { ContentTabStream } from "./stream";

export async function startBrowserContent() {
  new ContentTabStream();
  inject('injects/zilpay.js');
}
