/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { NFTToken, NFTMetadata, ZRCNFT, NFTFromServer } from 'types/token';
import type { NetworkControl } from 'core/background/services/network';
import type { AccountController } from 'core/background/services/account/account';
import type { ZilliqaControl } from 'core/background/services/blockchain';

import assert from 'assert';
import { BrowserStorage, buildObject } from 'lib/storage';
import { Fields } from 'config/fields';
import { TypeOf } from 'lib/type/type-checker';
import { ErrorMessages } from 'config/errors';
import { NETWORK_KEYS } from 'config/network';

const [mainnet] = NETWORK_KEYS;

export class NFTController {
  readonly #netwrok: NetworkControl;
  readonly #zilliqa: ZilliqaControl;
  readonly #account: AccountController;

  #identities: ZRCNFT[] = [];

  public get identities() {
    return this.#identities;
  }

  public get field() {
    const { base16 } = this.#account.selectedAccount;
    const { selected } = this.#netwrok;

    assert(Boolean(base16), ErrorMessages.WalletNotEnabled);
    assert(Boolean(selected), ErrorMessages.IncorrectNetwrok);

    return `${Fields.COLLECTION}/${selected}/${base16}`;
  }

  constructor(
    netwrok: NetworkControl,
    zilliqa: ZilliqaControl,
    account: AccountController
  ) {
    this.#netwrok = netwrok;
    this.#zilliqa = zilliqa;
    this.#account = account;
  }

  public async add(newToken: ZRCNFT) {
    this.#isUnique(newToken);
    this.#identities.push(newToken);

    await BrowserStorage.set(
      buildObject(this.field, this.identities)
    );
  }

  public async updateTokens() {
    assert(this.#netwrok.selected === mainnet, ErrorMessages.IncorrectNetwrok);

    const { base16 } = this.#account.selectedAccount;
    // const url = `${MAIN_API}/nfts/${base16}`;
    const url = `http://127.0.0.1:3000/api/v1/nfts/${base16}`;
    const res = await fetch(url);
    const list: NFTFromServer[] = await res.json();
    this.#identities = await Promise.all(list.map(async(t) => {
      let balances: NFTToken[] = [];
      if (t.baseUri) {
        balances = await Promise.all(t.balances.map(async(s) => ({
          id: s.tokenId,
          url: s.url,
          meta: await this.#getMeta(s.url)
        })));
      } else {
        balances = t.balances.map((s) => ({
          id: s.tokenId,
          url: s.url
        }));
      }

      return {
        balances,
        base16: t.base16,
        bech32: t.bech32,
        name: t.name,
        symbol: t.symbol
      };
    }));

    await BrowserStorage.set(
      buildObject(this.field, this.identities)
    );
  }

  public async sync() {
    const jsonList = await BrowserStorage.get(this.field);

    try {
      const list = JSON.parse(String(jsonList));

      if (!list || !TypeOf.isArray(list)) {
        return this.reset();
      }

      this.#identities = list;
    } catch {
      await this.reset();
    }
  }

  public async reset() {
    this.#identities = [];
    await BrowserStorage.set(
      buildObject(this.field, this.identities)
    );
  }

  async #getMeta(url: string): Promise<NFTMetadata | undefined> {
    const res = await fetch(url);

    try {
      const meta = await res.json();

      return {
        name: meta.name,
        attribute: meta.attribute,
        image: meta.image
      };
    } catch {
      return undefined;
    }
  }

  #isUnique(token: ZRCNFT) {
    for (let index = 0; index < this.#identities.length; index++) {
      const element = this.#identities[index];
      assert(element.base16 !== token.base16, ErrorMessages.MustBeUnique);
      assert(element.bech32 !== token.bech32, ErrorMessages.MustBeUnique);
      assert(element.name !== token.name, ErrorMessages.MustBeUnique);
    }
  }
}
