import type { Component } from "svelte";
import NotFoundPage from "../pages/NotFoundPage.svelte";
import HomePage from "../pages/Home.svelte";
import LockPage from "../pages/Lock.svelte";
import StartPage from "../pages/Start.svelte";
import ConnectPage from "../pages/Connect.svelte";
import ConfirmPopupPage from "../pages/ConfirmPopup.svelte";
import SignMessagePopupPage from "../pages/SignMessagePopup.svelte";
import LocalePage from "../pages/Locale.svelte";
import NewWalletOptionsPage from "../pages/NewWalletOptions.svelte";
import GenerateWalletPage from "../pages/GenerateWallet.svelte";
import RestoreWalletPage from "../pages/RestoreWallet.svelte";
import Bip39GeneratePage from "../pages/Bip39Generate.svelte";
import Bip39VerifyPage from "../pages/Bip39Verify.svelte";
import KeyPairGenPage from "../pages/KeyPairGen.svelte";
import Bip39RestorePage from "../pages/Bip39Restore.svelte"; 
import KeyPairRestorePage from "../pages/KeyPairRestore.svelte";
import NetworkSetupPage from '../pages/NetworkSetup.svelte';
import TokenManagerPage from '../pages/TokenManager.svelte';
import PasswordSetupPage from '../pages/PasswordSetup.svelte';


export type ParamsRecord = Record<string, string | null>;
export interface Route {
  path: string;
  component: Component;
  isProtected?: boolean;
}

export const notFoundRoute: Route = {
  path: "*",
  component: NotFoundPage,
};

export const protectedRoutes: Route[] = [
  { path: "/", component: HomePage, isProtected: true },
  { path: "/connect", component: ConnectPage, isProtected: true },
  { path: "/manage-tokens", component: TokenManagerPage, isProtected: true },
  { path: "/confirm", component: ConfirmPopupPage, isProtected: true },
  { path: "/sign-message", component: SignMessagePopupPage, isProtected: true },
];

export const publicRoutes: Route[] = [
  { path: "/lock", component: LockPage },
  { path: "/start", component: StartPage },
  { path: "/locale", component: LocalePage },
  { path: "/new-wallet-options", component: NewWalletOptionsPage },
  { path: "/generate-wallet", component: GenerateWalletPage },
  { path: "/restore-wallet", component: RestoreWalletPage },
  { path: "/restore-bip39", component: Bip39RestorePage },
  { path: "/generate-bip39", component: Bip39GeneratePage },
  { path: "/verify-bip39", component: Bip39VerifyPage },
  { path: "/keypair-generate", component: KeyPairGenPage },
  { path: "/restore-private-key", component: KeyPairRestorePage },
  { path: "/network-setup", component: NetworkSetupPage },
  { path: "/password-setup", component: PasswordSetupPage },
];

export const routes = [...protectedRoutes, ...publicRoutes];

export function matchRoute(url: string, routes: Route[]): Route | null {
  const urlParts = url.split("/").filter(Boolean);

  for (const route of routes) {
    const routeParts = route.path.split("/").filter(Boolean);

    if (!isMatchingLength(routeParts, urlParts)) {
      continue;
    }

    let isMatch = true;

    for (let i = 0; i < routeParts.length; i++) {
      const routePart = routeParts[i];
      const urlPart = urlParts[i];

      if (routePart.startsWith(":")) {
        const isOptional = routePart.endsWith("?");
        if (!urlPart && !isOptional) {
          isMatch = false;
          break;
        }
        continue;
      }

      if (routePart !== urlPart) {
        isMatch = false;
        break;
      }
    }

    if (isMatch) {
      return route;
    }
  }

  return null;
}

export function parseUrlParams(pattern: string, url: string): ParamsRecord {
  const params: ParamsRecord = {};
  const patternParts: string[] = pattern.split("/").filter(Boolean);
  const urlParts: string[] = url.split("/").filter(Boolean);

  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];

    if (!patternPart.startsWith(":")) {
      continue;
    }

    let paramName = patternPart.slice(1);
    const isOptional = paramName.endsWith("?");

    if (isOptional) {
      paramName = paramName.slice(0, -1);
    }

    const value = urlParts[i];
    params[paramName] = value || null;
  }

  return params;
}

function isMatchingLength(routeParts: string[], urlParts: string[]): boolean {
  const optionalParams = routeParts.filter((part) => part.endsWith("?")).length;
  return (
    urlParts.length >= routeParts.length - optionalParams &&
    urlParts.length <= routeParts.length
  );
}
