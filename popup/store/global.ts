import type { IBackgroundState } from "background/storage";
import { Locales } from "config/locale";
import { Themes } from "config/theme";
import { writable } from "svelte/store";


export default writable<IBackgroundState>({
  storageVersion: 4,
  wallets: [],
  selectedWallet: -1,
  notificationsGlobalEnabled: true,
  locale: Locales.Auto,
  appearances: Themes.System,
  abbreviatedNumber: true,
  hideBalance: false,
  tokensRow: true,
  chains: [],
  book: [],
  connections: {
    list: [],
  }
});

