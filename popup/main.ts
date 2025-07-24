import { Themes } from "config/theme";
import { mount } from "svelte";
import App from "./App.svelte";
import { BrowserStorage } from "lib/storage";
import globalStore from "popup/store/global";
import { Locales } from "config/locale";
import { themeDetect } from "./mixins/theme";

let app = {};

const STORAGE_FILED_THEME = "zilpay_theme";
const STORAGE_FILED_LOCALE = "zilpay_locale";

async function getGlobalSettings() {
  let storedData = await BrowserStorage.get<Record<string, string>>(
    STORAGE_FILED_THEME,
    STORAGE_FILED_LOCALE,
  );
  let theme = (storedData[STORAGE_FILED_THEME] as Themes) ?? Themes.System;
  let locale = (storedData[STORAGE_FILED_LOCALE] as Locales) ?? Locales.Auto;

  if (theme == Themes.System) {
    theme = themeDetect();
  }

  document.body.setAttribute("theme", theme);

  globalStore.set({
    theme,
    locale,
  });
}

getGlobalSettings().finally(() => {
  app = mount(App, {
    target: document.body,
  });
});

export default app;
