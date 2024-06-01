/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import { ManifestVersions } from 'config/manifest-versions';
import { getManifestVersion, Runtime } from 'lib/runtime';
import { push } from 'svelte-spa-router';

export async function closePopup() {
  if (getManifestVersion() == ManifestVersions.V2) {
    try {
      window.close();
    } catch {
      ////
    }

    try {
      const { id } = await Runtime.windows.getCurrent();

      if (String(id)) {
        Runtime.windows.remove(Number(id), console.error);
      }
    } catch {
      ////
    }
  } else {
    const pop = await Runtime.windows.getCurrent();

    if (pop.type == "popup") {
      Runtime.windows.remove(Number(pop.id), console.error);
    } else if (pop.type == "normal") {
      push('/');
    }
  }
}
