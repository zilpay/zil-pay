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

import assert from 'assert';
import { BrowserStorage, buildObject } from 'lib/storage';
import { Methods, ZilliqaControl } from 'core/background/services/blockchain';
import { Fields } from 'config/fields';
import { TypeOf } from 'lib/type/type-checker';
import { ErrorMessages } from 'config/errors';
import { NETWORK_KEYS } from 'config/network';
import { toChecksumAddress, tohexString } from 'lib/utils/address';
import { initParser } from 'lib/utils/parse-init';
import { toBech32Address } from 'lib/utils/bech32';

const [mainnet] = NETWORK_KEYS;

export class NFTController {

  public static Fields = {
    TokenOwners: 'token_owners',
    TokenUris: 'token_uris',
    BaseUri: 'base_uri'
  };

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

  public async fetchNFT(addr: string): Promise<ZRCNFT> {
    const { TokenOwners, TokenUris, BaseUri } = NFTController.Fields;
    const base16 = tohexString(addr);
    const account = this.#account.selectedAccount;
    const identities = [
      this.#zilliqa.provider.buildBody(
        Methods.GetSmartContractInit,
        [base16]
      ),
      this.#zilliqa.provider.buildBody(
        Methods.GetSmartContractSubState,
        [base16, TokenOwners, []]
      ),
      this.#zilliqa.provider.buildBody(
        Methods.GetSmartContractSubState,
        [base16, TokenUris, []]
      ),
      this.#zilliqa.provider.buildBody(
        Methods.GetSmartContractSubState,
        [base16, BaseUri, []]
      )
    ];
    const [
      init,
      tokenOwners,
      tokenUrls,
      baseUri
    ] = await this.#zilliqa.sendJson(...identities);
    const constructor = initParser(init.result);
    const baseURL = baseUri.result && baseUri.result[BaseUri];
    const balances = await this.#parseTokenOwners(
      tokenOwners.result && tokenOwners.result[TokenOwners],
      tokenUrls.result && tokenUrls.result[TokenUris],
      account.base16,
      baseURL
    );

    return {
      balances,
      base16: toChecksumAddress(constructor.address),
      bech32: toBech32Address(constructor.address),
      baseUri: baseURL,
      name: constructor.name,
      symbol: constructor.symbol
    };
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
          meta: await this.#getMeta(`${t.baseUri}/${s.tokenId}`)
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
        symbol: t.symbol,
        baseUri: t.baseUri
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

    console.log(await this.fetchNFT('0x8ab2af0cccee7195a7c16030fbdfde6501d91903'));
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
        attributes: meta.attributes,
        image: meta.image
      };
    } catch {
      return undefined;
    }
  }

  async #parseTokenOwners(owners: object, uris: object, acc: string, baseUri?: string) {
    const list: NFTToken[] = [];

    acc = String(acc).toLowerCase();

    if (baseUri && String(baseUri).endsWith('/')) {
      baseUri = baseUri.substring(0, baseUri.length - 1);
    }

    for (const key in owners) {
      const owner = owners[key];
      let url = uris[key];
      let meta;

      if (owner !== acc) {
        continue;
      }

      if (baseUri) {
        url = `${baseUri}/${key}`;
        meta = await this.#getMeta(url);
      }

      list.push({
        url,
        id: key
      });
    }

    return list;
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
