import { get } from "svelte/store";

import { type Route } from "./index";

export class RouteGuard {
  private static navigate(path: string) {
    window.location.hash = path;
  }

  static checkRoute(route: Route): Route {
    if (!route.isProtected) {
      return route;
    }

    // if (!guard.isReady) {
    //   this.navigate("/start");

    //   return { path: "/start", component: StartPage };
    // }

    // if (guard.isReady && !guard.isEnable) {
    //   this.navigate("lock");
    //   return {
    //     path: "/lock",
    //     component: LockPage,
    //   };
    // }

    // if (appsConnect.length > 0) {
    //   this.navigate("connect");
    //   return {
    //     path: "/connect",
    //     component: ConnectPage,
    //   };
    // }

    // if (confirm.length > 0) {
    //   this.navigate("confirm");
    //   return {
    //     path: "/confirm",
    //     component: PopupPage,
    //   };
    // }

    // if (message) {
    //   this.navigate("sign-message");
    //   return {
    //     path: "/sign-message",
    //     component: SignMessagePage,
    //   };
    // }

    return route;
  }
}
