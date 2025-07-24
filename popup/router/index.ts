import type { Component } from "svelte";
import NotFoundPage from "../pages/NotFoundPage.svelte";
import HomePage from "../pages/Home.svelte";
import LockPage from "../pages/Lock.svelte";
import StartPage from "../pages/Start.svelte";

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
];

export const publicRoutes: Route[] = [
  { path: "/lock", component: LockPage },
  { path: "/start", component: StartPage },
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
