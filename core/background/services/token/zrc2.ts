/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { ZRC2Token, InitItem, ZRC2Info } from 'types/token';
import type { NetworkControl } from 'core/background/services/network';
import type { AccountController } from 'core/background/services/account/account';

import assert from 'assert';

import { Methods, ZilliqaControl } from 'core/background/services/blockchain';
import { DexController, ZRC2Fields } from 'core/background/services/dex';

import { Contracts } from 'config/contracts';
import { BrowserStorage, buildObject } from 'lib/storage';
import { Fields } from 'config/fields';
import { TypeOf } from 'lib/type/type-checker';
import { NETWORK } from 'config/network';
import { ErrorMessages } from 'config/errors';
import { fromBech32Address } from 'lib/utils/bech32';
import { tohexString } from 'lib/utils/address';
import { initParser, InitFields } from 'lib/utils/parse-init';


const [mainnet, testnet, custom] = Object.keys(NETWORK);

export const ZIL = {
  base16: Contracts.ZERO_ADDRESS,
  bech32: 'zil1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq9yf6pz',
  decimals: 12,
  name: 'Zilliqa',
  symbol: 'ZIL',
  rate: 1,
  pool: []
};
export const ZLP = {
  base16: Contracts.ZIlPay,
  bech32: 'zil1l0g8u6f9g0fsvjuu74ctyla2hltefrdyt7k5f4',
  decimals: 18,
  name: 'ZilPay wallet',
  symbol: 'ZLP',
  rate: 0,
  pool: []
};
export const stZIL = {
  base16: '0xe6f14afc8739a4ead0a542c07d3ff978190e3b92',
  bech32: 'zil1umc54ly88xjw4599gtq860le0qvsuwuj72s246',
  decimals: ZIL.decimals,
  name: 'StZIL',
  symbol: 'stZIL',
  rate: 0,
  pool: []
};
const INIT = {
  [mainnet]: [ZIL, ZLP, stZIL],
  [testnet]: [ZIL, {
    ...ZLP,
    base16: '0x55cb580c6bdf40e400f3714651bb7643bca24de4',
    bech32: 'zil12h94srrtmaqwgq8nw9r9rwmkgw72yn0yc7x9ud'
  }, {
      ...stZIL,
      base16: '0x8942db467107434d3be0bbe0e3aa4346c89a1427',
      bech32: 'zil139pdk3n3qap56wlqh0sw82jrgmyf59p8xqxqv2',
    }],
  [custom]: [ZIL]
};

export class ZRC2Controller {
  readonly #netwrok: NetworkControl;
  readonly #zilliqa: ZilliqaControl;
  readonly #account: AccountController;
  readonly #dex: DexController;
  #identities: ZRC2Token[] = [];

  public get identities() {
    return this.#identities;
  }

  public get field() {
    return `${Fields.TOKENS}/${this.#netwrok.selected}`;
  }

  constructor(
    netwrok: NetworkControl,
    zilliqa: ZilliqaControl,
    account: AccountController,
    dex: DexController
  ) {
    this.#netwrok = netwrok;
    this.#zilliqa = zilliqa;
    this.#account = account;
    this.#dex = dex;
    this.#account.initZRC(this);
  }

  public async getAllowances(contract: string, token: string, owner: string) {
    owner = String(owner).toLowerCase();
    contract = String(contract).toLowerCase();

    const identities = [
      this.#zilliqa.provider.buildBody(
        Methods.GetSmartContractSubState,
        [tohexString(token), ZRC2Fields.Allowances, [owner, contract]]
      )
    ];
    const res = await this.#zilliqa.sendJson(...identities);

    if (res && res.result && res.result[ZRC2Fields.Allowances]) {
      return res.result[ZRC2Fields.Allowances][owner][contract];
    }

    return '0';
  }

  public async remove(index: number) {
    assert(index >= 2, ErrorMessages.OutOfIndex);

    await this.#account.removeToken(this.#identities[index]);

    delete this.#identities[index];
    this.#identities = this.#identities.filter(Boolean);

    await BrowserStorage.set(
      buildObject(this.field, this.identities)
    );
  }

  public async add(token: ZRC2Info) {
    const newToken: ZRC2Token = {
      decimals: token.decimals,
      name: token.name,
      symbol: token.symbol,
      base16: token.base16,
      bech32: token.bech32,
      rate: token.rate || 0,
      pool: token.pool
    };
    this.#isUnique(newToken);
    this.#identities.push(newToken);

    await this.#account.addToken(newToken, token.balance);
    await BrowserStorage.set(
      buildObject(this.field, this.identities)
    );
  }

  public async getZRCInit(address: string) {
    const init = await this.#zilliqa.getSmartContractInit(address);

    return this.#toZRC2(init);
  }

  public async getToken(bech32: string): Promise<ZRC2Info> {
    let pool: string[] = [];
    let balance = '0';
    let rate = 0;
    const address = fromBech32Address(bech32);
    const addr = tohexString(address);
    const tokenAddressBase16 = address.toLowerCase();
    const userAddress = this.#account.selectedAccount ?
      this.#account.selectedAccount.base16.toLowerCase() :
      Contracts.ZERO_ADDRESS.toLowerCase();
    const identities = [
      this.#zilliqa.provider.buildBody(Methods.GetSmartContractInit, [addr]),
      this.#zilliqa.provider.buildBody(
        Methods.GetSmartContractSubState,
        [addr, ZRC2Fields.Balances, [userAddress]]
      )
    ];
    if (this.#dex.contract) {
      identities.push(
        this.#zilliqa.provider.buildBody(
          Methods.GetSmartContractSubState,
          [
            tohexString(this.#dex.contract),
            ZRC2Fields.Pools,
            [tokenAddressBase16]
          ]
        )
      );
    }
    const replies = await this.#zilliqa.sendJson(...identities);
    assert(Array.isArray(replies), `${ErrorMessages.MustBe} array`);
    const zrc = this.#toZRC2(replies[0].result);
    if (replies[1].result && replies[1].result[ZRC2Fields.Balances] && replies[1].result[ZRC2Fields.Balances][userAddress]) {
      balance = replies[1].result[ZRC2Fields.Balances][userAddress];
    }
    if (replies.length === 3 && replies[2].result && replies[2].result[ZRC2Fields.Pools] && replies[2].result[ZRC2Fields.Pools][tokenAddressBase16]) {
      pool = replies[2].result[ZRC2Fields.Pools][tokenAddressBase16].arguments;
      const [zilReserve, tokenReserve] = pool;
      rate = this.#calcRate(zilReserve, tokenReserve, zrc.decimals);
    }
    return {
      balance,
      bech32,
      rate,
      pool,
      name: zrc.name,
      symbol: zrc.symbol,
      decimals: zrc.decimals,
      base16: address
    };
  }

  public async getBalance(owner: string) {
    const hexOwner = tohexString(owner);
    const base16Owner = String(owner).toLowerCase();
    const onlyZRC2 = this.identities.slice(1);
    const balanceIdentities = this.identities.map((token) => {
      if (token.base16 === Contracts.ZERO_ADDRESS) {
        return this.#zilliqa.provider.buildBody(Methods.getBalance, [hexOwner]);
      }
      return this.#zilliqa.provider.buildBody(
        Methods.GetSmartContractSubState,
        [tohexString(token.base16), ZRC2Fields.Balances, [base16Owner]]
      );
    });

    const poolIdentities = this.#dex.contract
      ? onlyZRC2.map((token) =>
          this.#zilliqa.provider.buildBody(
            Methods.GetSmartContractSubState,
            [tohexString(this.#dex.contract), ZRC2Fields.Pools, [token.base16.toLowerCase()]]
          )
        )
      : [];

    const identities = [...balanceIdentities, ...poolIdentities];
    let replies = await this.#zilliqa.sendJson(...identities);

    if (!Array.isArray(replies)) {
      replies = [replies];
    }

    const entries = replies.slice(0, balanceIdentities.length).map((res, index) => {
      const { base16 } = this.identities[index];
      let balance = '0';
      if (res.result) {
        if (base16 === Contracts.ZERO_ADDRESS) {
          balance = res.error ? '0' : res.result.balance;
        } else if (res.result[ZRC2Fields.Balances]?.[base16Owner]) {
          balance = res.result[ZRC2Fields.Balances][base16Owner];
        }
      }
      return [base16, balance];
    });

    for (let index = 0; index < this.identities.length; index++) {
      const token = this.identities[index];
      if (token.base16 === Contracts.ZERO_ADDRESS) {
        continue;
      }

      token.pool = [];
      token.rate = 0;

      if (poolIdentities.length > 0) {
        const poolIndex = index - 1 + balanceIdentities.length;
        const poolResponse = replies[poolIndex];
        if (
          poolResponse?.result?.[ZRC2Fields.Pools]?.[token.base16.toLowerCase()]?.arguments
        ) {
          const poolPair = poolResponse.result[ZRC2Fields.Pools][token.base16.toLowerCase()].arguments;
          const [zilReserve, tokenReserve] = poolPair;
          token.pool = poolPair;
          token.rate = this.#calcRate(zilReserve, tokenReserve, token.decimals);
        }
      }
    }

    await BrowserStorage.set(buildObject(this.field, this.identities));
    return Object.fromEntries(entries);
  }

  public async sync() {
    const jsonList = await BrowserStorage.get(this.field);

    try {
      const list = JSON.parse(String(jsonList));

      if (!list || !TypeOf.isArray(list)) {
        return this.reset();
      }

      if (list.length < this.#identities.length) {
        return this.reset();
      }

      this.#identities = list.reduce((acc: ZRC2Token[], x: ZRC2Token) =>
        acc.concat(
          acc.find((y) => tohexString(y.base16) === tohexString(x.base16)) ? [] : [x]
        )
        , INIT[this.#netwrok.selected]);
    } catch {
      await this.reset();
    }
  }

  public async reset() {
    const init = INIT[this.#netwrok.selected];
    this.#identities = init;
    await BrowserStorage.set(
      buildObject(this.field, this.identities)
    );
  }

  #isUnique(token: ZRC2Token) {
    for (let index = 0; index < this.#identities.length; index++) {
      const element = this.#identities[index];
      assert(element.base16 !== token.base16, ErrorMessages.MustBeUnique);
      assert(element.bech32 !== token.bech32, ErrorMessages.MustBeUnique);
      assert(element.symbol !== token.symbol, ErrorMessages.MustBeUnique);
    }
  }

  #toZRC2(init: InitItem[]) {
    const { contractOwner, name, symbol, address, decimals } = initParser(init);

    assert(Boolean(contractOwner), `${InitFields.ContractOwner} ${ErrorMessages.RequiredParam}`);
    assert(Boolean(name), `${InitFields.Name} ${ErrorMessages.RequiredParam}`);
    assert(Boolean(symbol), `${InitFields.Symbol} ${ErrorMessages.RequiredParam}`);
    assert(Boolean(address), `${InitFields.Address} ${ErrorMessages.RequiredParam}`);

    return {
      decimals: Number(decimals),
      contractOwner,
      name,
      symbol,
      address
    };
  }

  #calcRate(zilReserve: string, tokenReserve: string, decimals: number) {
    const _zilReserve = Number(zilReserve) * Math.pow(10, -1 * ZIL.decimals);
    const _tokenReserve = Number(tokenReserve) * Math.pow(10, -1 * decimals);
    const exchangeRate = (_zilReserve / _tokenReserve).toFixed(10);

    return Number(exchangeRate);
  }
}
