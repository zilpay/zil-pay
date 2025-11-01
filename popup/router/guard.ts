import { get } from "svelte/store";
import globalStore from "popup/store/global";
import { type Route } from "./index";
import StartPage from "../pages/Start.svelte";
import LockPage from "../pages/Lock.svelte";
import ConfirmPopupPage from "../pages/ConfirmPopup.svelte";
import ConnectPage from "../pages/Connect.svelte";
import SignMessagePopupPage from "../pages/SignMessagePopup.svelte";
import AddChainPage from "../pages/AddChain.svelte";
import AddAssetsPage from "../pages/AddAssets.svelte";
import { linksExpand } from "popup/mixins/links";

export class RouteGuard {
  private static navigate(path: string) {
    window.location.hash = path;
  }

  static checkRoute(route: Route): Route {
    if (!route.isProtected) {
      return route;
    }

    const globalState = get(globalStore);

    if (globalState.wallets.length == 0 && window.location.hash == '') {
      linksExpand("/start");      
    }

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

      if ((last?.evm || last?.scilla) && !window.location.hash.includes('confirm')) {
        this.navigate("confirm");
        return {
          path: "/confirm",
          component: ConfirmPopupPage,
        };
      } else if (last?.connect && !window.location.hash.includes('connect')) {
        this.navigate("connect");
        return {
          path: "/connect",
          component: ConnectPage,
        };
      } else if ((last?.signMessageScilla || last?.signPersonalMessageEVM || last?.signTypedDataJsonEVM) && !window.location.hash.includes('sign-message')) {
        this.navigate("sign-message");
        return {
          path: "/sign-message",
          component: SignMessagePopupPage,
        };
      } else if (last?.evmAddChainRequest && !window.location.hash.includes('add-chain')) {
        this.navigate("add-chain");
        return {
          path: "/add-chain",
          component: AddChainPage,
        };
      } else if (last?.evmAddAssetRequest && !window.location.hash.includes('add-asset')) {
        this.navigate("add-asset");
        return {
          path: "/add-asset",
          component: AddAssetsPage,
        };
      }
    }

    return route;
  }
}
