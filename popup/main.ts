import { mount } from "svelte";
import App from "./App.svelte";
import { getGlobalState } from "./background/wallet";

let app = {};

getGlobalState().finally(() => {
  app = mount(App, {
    target: document.body,
  });
});

export default app;
