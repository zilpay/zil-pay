import type { IExplorerState, IChainConfigState, IFTokenState } from "background/storage";
import { Themes } from "config/theme";
import { themeDetect } from "popup/mixins/theme";

function selectVariant(theme: Themes, options: string[]): string {
  if (options.length === 0) return '';
  if (theme === Themes.System) {
    theme = themeDetect();
  }

  if (theme === Themes.Light) return options[0];
  if (theme === Themes.Dark && options.length >= 2) return options[1];
  return options[0];
}

function processUrlTemplate({
  template,
  theme,
  replacements = {},
}: {
  template: string;
  theme: Themes;
  replacements?: Record<string, string>;
}): string {
  if (!template.includes('%{')) return template;

  let processed = template;

  const funcRegex = /%\{(\w+)\(([^)]+)\)\}%/g;
  processed = processed.replace(funcRegex, (_match, _, optionsStr) => {
    const options = optionsStr.split(',').map((s: string) => s.trim());
    return selectVariant(theme, options);
  });

  if (processed.includes('%{dark,light}%')) {
    processed = processed.replace(/%\{dark,light\}%/g, theme === Themes.Dark ? 'light' : 'dark');
  }

  for (const [key, value] of Object.entries(replacements)) {
    processed = processed.replace(new RegExp(`%{${key}}%`, 'g'), value);
  }

  return processed;
}

export function processTokenLogo({
  token,
  shortName,
  theme,
}: {
  token: IFTokenState;
  shortName?: string;
  theme: Themes;
}): string {
  if (!token.logo) return 'assets/icons/warning.svg';

  const replacements = {
    'symbol': token.symbol.toLowerCase(),
    'contract_address': token.addr.toLowerCase(),
    'name': token.name,
    'shortName': shortName ?? "",
  };

  return processUrlTemplate({
    template: token.logo,
    theme: theme,
    replacements: replacements,
  });
}

export function formExplorerUrl(explorer: IExplorerState, transactionHash: string): string {
 const baseUrl = explorer.url.endsWith('/')
    ? explorer.url.substring(0, explorer.url.length - 1)
    : explorer.url;

  return `${baseUrl}/tx/${transactionHash}`;
}

export function viewChain({
  network,
  theme,
}: {
  network?: IChainConfigState;
  theme: Themes;
}): string {
  if (!network) {
    return "";
  }

  const replacements = {
    'shortName': network.shortName.toLowerCase(),
  };

  return processUrlTemplate({
    template: network.logo,
    theme: theme,
    replacements: replacements,
  });
}
