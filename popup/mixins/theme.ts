/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2023 ZilPay
 */
import { Themes } from "config/theme";


export function themeDetect() {
  const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");
  const isDark = Boolean(darkThemeMq.matches);

  return isDark ? Themes.Dark : Themes.Light;
}
