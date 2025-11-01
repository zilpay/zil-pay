import { Themes } from "config/theme";

export function themeDetect() {
  if (!globalThis.matchMedia) {
    return Themes.Light;
  }

  const darkThemeMq = globalThis.matchMedia("(prefers-color-scheme: dark)");
  const isDark = Boolean(darkThemeMq.matches);

  return isDark ? Themes.Dark : Themes.Light;
}
