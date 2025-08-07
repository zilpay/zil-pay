import { Themes } from "config/theme";

export function themeDetect() {
  const darkThemeMq = globalThis.matchMedia("(prefers-color-scheme: dark)");
  const isDark = Boolean(darkThemeMq.matches);

  return isDark ? Themes.Dark : Themes.Light;
}
