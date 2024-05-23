/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2024 ZilPay
 */
import { BrowserStorage, buildObject } from 'lib/storage';
import { Fields } from 'config/fields';
import { TypeOf } from 'lib/type/type-checker';
import { getManifestVersion, Runtime } from 'lib/runtime';
import { ManifestVersions } from 'config/manifest-versions';

export class BadgeControl {
  #counter = 0;

  get counter() {
    return this.#counter;
  }

  async setCounter(n = 0) {
    this.#counter = n;

    this.#showBadge();

    await BrowserStorage.set(
      buildObject(Fields.BADGE_COUNTER, String(this.counter))
    );
  }

  async increase(n = 1) {
    this.#counter += n;

    this.#showBadge();

    await BrowserStorage.set(
      buildObject(Fields.BADGE_COUNTER, String(this.counter))
    );
  }

  async decrease(n = 1) {
    this.#counter -= n;

    if (this.counter < 0) {
      this.#counter = 0;
    }

    this.#showBadge();

    await BrowserStorage.set(
      buildObject(Fields.BADGE_COUNTER, String(this.counter))
    );
  }

  async sync() {
    const counter = await BrowserStorage.get(Fields.BADGE_COUNTER);

    if (!TypeOf.isUndefined(counter)) {
      const count = Number(counter);

      if (!isNaN(count)) {
        this.#counter = count;
      }
    } else {
      await this.reset();
    }

    this.#showBadge();
  }

  async reset() {
    this.#counter = 0;

    await BrowserStorage.set(
      buildObject(Fields.BADGE_COUNTER, String(this.counter))
    );

    this.#showBadge();
  }

  #showBadge() {
    const mvVersion = getManifestVersion();
    const text = this.counter === 0 ? '' : String(this.counter);

    if (ManifestVersions.V2 === mvVersion) {
      Runtime.browserAction.setBadgeText({
        text
      });
    } else if (ManifestVersions.V3 === mvVersion) {
      Runtime.action.setBadgeText({
        text
      });
    }
  }
}
