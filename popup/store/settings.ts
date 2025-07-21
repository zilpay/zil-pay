import { Locales } from "config/locale";
import { Themes } from "config/theme";
import { writable } from "svelte/store";

export default writable({
  locale: Locales.Auto,
  theme: Themes.System,
});
