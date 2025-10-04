import type { IAccountState, IFTokenState } from "background/storage";

export function getChainTokens(tokens: IFTokenState[], account: IAccountState) {
  return tokens.filter((t) => t.chainHash == account.chainHash);
}
