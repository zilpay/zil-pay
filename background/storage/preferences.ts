export enum Theme {
  System,
  Light,
  Dark,
}

export class UserPreferences {
  theme: Theme;
  selectedLocale: string;
  popupEnabled: boolean;
  defaultCurrency: string;
  badgeCounterEnabled: boolean;
  hideBalances: boolean;

  constructor(data: Record<string, unknown>) {
    this.theme = data.theme as Theme;
    this.selectedLocale = (data.selectedLocale as string) ?? "auto";
    this.popupEnabled = (data.popupEnabled as boolean) ?? true;
    this.defaultCurrency = (data.defaultCurrency as string) ?? "btc";
    this.badgeCounterEnabled = (data.badgeCounterEnabled as boolean) ?? true;
    this.hideBalances = (data.hideBalances as boolean) ?? false;
  }

  toJSON(): Record<string, unknown> {
    return {
      theme: this.theme,
      selectedLocale: this.selectedLocale,
      popupEnabled: this.popupEnabled,
      defaultCurrency: this.defaultCurrency,
      badgeCounterEnabled: this.badgeCounterEnabled,
      hideBalances: this.hideBalances,
    };
  }
}
