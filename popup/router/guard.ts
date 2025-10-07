import { get } from "svelte/store";
import globalStore from "popup/store/global";
import { type Route } from "./index";
import StartPage from "../pages/Start.svelte";
import LockPage from "../pages/Lock.svelte";
import ConfirmPopupPage from "../pages/ConfirmPopup.svelte";

export class RouteGuard {
  private static navigate(path: string) {
    window.location.hash = path;
  }

  static checkRoute(route: Route): Route {
    if (!route.isProtected) {
      return route;
    }

    const globalState = get(globalStore);

    if (globalState.wallets.length == 0) {
      this.navigate("/start");

      return { path: "/start", component: StartPage };
    }

    const wallet = globalState.wallets[globalState.selectedWallet]; 

    if (globalState.selectedWallet == -1 || !wallet) {
      this.navigate("lock");
      return {
        path: "/lock",
        component: LockPage,
      };
    }

    if (wallet.confirm.length != 0) {
      const last = wallet.confirm[wallet.confirm.length - 1];

      if (last?.evm || last?.scilla) {
        this.navigate("confirm");
        return {
          path: "/confirm",
          component: ConfirmPopupPage,
        };
      } else {
        // TODO: add connect and sign message.
      }
    }

    return route;
  }
}
