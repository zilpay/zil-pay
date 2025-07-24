import type { BackgroundState, Wallet, ChainConfig } from "background/storage";
import { Locales } from "config/locale";
import { Themes } from "config/theme";
import { writable } from "svelte/store";

type BackgroundStateData = Omit<BackgroundState, 'getChain' | 'sync'>;
type WalletData = Omit<
  Wallet,
  | 'decrypt'
  | 'encrypt'
  | 'unlock'
  | 'revealKeypair'
  | 'revealMnemonic'
  | 'clearSession'
  | 'vault'
  | '#vault'
  | '#session'
>;

export default writable<BackgroundStateData>({
  wallets: [] as WalletData[],
  selected_wallet: 0,
  notificationsGlobalEnabled: true,
  locale: Locales.Auto,
  appearances: Themes.System,
  abbreviatedNumber: true,
  hideBalance: false,
  chains: [] as ChainConfig[], 
});

