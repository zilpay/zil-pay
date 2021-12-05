/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { ZRC2Token, InitItem, ZRC2Info } from 'types/token';
import { Methods, ZilliqaControl } from 'core/background/services/blockchain';
import type { NetworkControl } from 'core/background/services/network';
import type { AccountController } from 'core/background/services/account/account';
import assert from 'assert';
import { Contracts } from 'config/contracts';
import { BrowserStorage, buildObject } from 'lib/storage';
import { Fields } from 'config/fields';
import { TypeOf } from 'lib/type/type-checker';
import { NETWORK } from 'config/network';
import { ErrorMessages } from 'config/errors';
import { fromBech32Address } from 'lib/utils/bech32';
import { tohexString } from 'lib/utils/address';
import type { RPCResponse } from 'types/zilliqa';

enum InitFields {
  ContractOwner = 'contract_owner',
  Name = 'name',
  Symbol = 'symbol',
  Decimals = 'decimals',
  Address = '_this_address'
}

enum ZRC2Fields {
  Balances = 'balances',
  Pools = 'pools'
}

const [mainnet, testnet, custom] = Object.keys(NETWORK);

export const ZIL = {
  base16: Contracts.ZERO_ADDRESS,
  bech32: 'zil1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq9yf6pz',
  decimals: 12,
  name: 'Zilliqa',
  symbol: 'ZIL',
  rate: 1
};
export const ZLP = {
  base16: Contracts.ZIlPay,
  bech32: 'zil1l0g8u6f9g0fsvjuu74ctyla2hltefrdyt7k5f4',
  decimals: 18,
  name: 'ZilPay wallet',
  symbol: 'ZLP',
  rate: 0
};
const INIT = {
  [mainnet]: [ZIL, ZLP],
  [testnet]: [ZIL],
  [custom]: [ZIL]
};

export class ZRC2Controller {
  readonly #netwrok: NetworkControl;
  readonly #zilliqa: ZilliqaControl;
  readonly #account: AccountController;
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
    account: AccountController
  ) {
    this.#netwrok = netwrok;
    this.#zilliqa = zilliqa;
    this.#account = account;
    this.#account.initZRC(this);
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
      rate: token.rate || 0
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
    let balance = '0';
    let rate = 0;
    const address = fromBech32Address(bech32);
    const addr = tohexString(address);
    const tokenAddressBase16 = address.toLowerCase();
    const userAddress = Boolean(this.#account.selectedAccount) ?
      String(this.#account.selectedAccount.base16).toLowerCase() :
      String(Contracts.ZERO_ADDRESS).toLowerCase();
    const identities = [
      this.#zilliqa.provider.buildBody(Methods.GetSmartContractInit, [addr]),
      this.#zilliqa.provider.buildBody(
        Methods.GetSmartContractSubState,
        [addr, ZRC2Fields.Balances, [userAddress]]
      ),
      this.#zilliqa.provider.buildBody(
        Methods.GetSmartContractSubState,
        [
          tohexString(Contracts.ZIL_SWAP),
          ZRC2Fields.Pools,
          [tokenAddressBase16]
        ]
      )
    ];
    const replies = await this.#zilliqa.sendJson(...identities);
    assert(Array.isArray(replies), `${ErrorMessages.MustBe} array`);
    const zrc = this.#toZRC2(replies[0].result);

    if (replies[1].result) {
      balance = replies[1].result[ZRC2Fields.Balances][userAddress];
    }
    if (replies[2].result) {
      const pool = replies[2].result[ZRC2Fields.Pools];
      const [zilReserve, tokenReserve] = pool[tokenAddressBase16].arguments;
      rate = this.#calcRate(
        zilReserve,
        tokenReserve,
        zrc.decimals
      );
    }

    return {
      balance,
      bech32,
      rate,
      name: zrc.name,
      symbol: zrc.symbol,
      decimals: zrc.decimals,
      base16: address
    };
  }

  public async getBalance(owner: string) {
    const address = tohexString(owner);
    const addr = String(owner).toLowerCase();
    const balanceIdentities = this.identities.map((token) => {
      if (token.base16 === Contracts.ZERO_ADDRESS) {
        return this.#zilliqa.provider.buildBody(
          Methods.getBalance,
          [address]
        );
      }

      return this.#zilliqa.provider.buildBody(
        Methods.GetSmartContractSubState,
        [tohexString(token.base16), ZRC2Fields.Balances, [addr]]
      );
    });
    const dexContract = tohexString(Contracts.ZIL_SWAP);
    const tokensIdentities = this.identities.filter((t) => t.base16 !== Contracts.ZERO_ADDRESS);
    const tokensRates = tokensIdentities.map((token) => {
      const tokenAddress = token.base16.toLowerCase();
      return this.#zilliqa.provider.buildBody(
        Methods.GetSmartContractSubState,
        [dexContract, ZRC2Fields.Pools, [tokenAddress]]
      );
    });
    const identities = [...balanceIdentities, ...tokensRates];
    let replies = await this.#zilliqa.sendJson(...identities);

    if (!Array.isArray(replies)) {
      replies = [replies];
    }

    const pools = replies.slice(balanceIdentities.length);
    const balances = replies.slice(0, balanceIdentities.length);
    const entries = balances.map((res: RPCResponse, index: number) => {
      const { base16 } = this.identities[index];
      let balance = [base16, '0'];
      if (res.result && base16 === Contracts.ZERO_ADDRESS) {
        balance = res.error ? [base16, '0'] : [base16, res.result.balance];
      } else if (res.result) {
        const bal = res.result[ZRC2Fields.Balances][addr];
        balance = [base16, bal];
      }

      return balance;
    });

    await this.#updateRate(pools);

    return Object.fromEntries(entries);
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
      assert(element.name !== token.name, ErrorMessages.MustBeUnique);
    }
  }

  #toZRC2(init: InitItem[]) {
    const contractOwner = init.find((el) => el.vname === InitFields.ContractOwner)?.value;
    const name = init.find((el) => el.vname === InitFields.Name)?.value || '';
    const symbol = init.find((el) => el.vname === InitFields.Symbol)?.value;
    const address = init.find((el) => el.vname === InitFields.Address)?.value;
    const decimals = init.find((el) => el.vname === InitFields.Decimals)?.value;

    assert(Boolean(contractOwner), `${InitFields.ContractOwner} ${ErrorMessages.RequiredParam}`);
    assert(Boolean(name), `${InitFields.Name} ${ErrorMessages.RequiredParam}`);
    assert(Boolean(symbol), `${InitFields.Symbol} ${ErrorMessages.RequiredParam}`);
    assert(Boolean(address), `${InitFields.Address} ${ErrorMessages.RequiredParam}`);
    assert(Boolean(decimals), `${InitFields.Decimals} ${ErrorMessages.RequiredParam}`);

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

  async #updateRate(pools: object[]) {
    for (let index = 0; index < pools.length; index++) {
      const res = pools[index];

      try {
        const pool = res['result'][ZRC2Fields.Pools];
        const [base16] = Object.keys(pool);
        const foundIndex = this.identities.findIndex(
          (t) => t.base16.toLowerCase() === base16
        );
        const foundToken = this.identities[foundIndex];
        const [zilReserve, tokenReserve] = pool[base16].arguments;

        this.identities[foundIndex].rate = this.#calcRate(
          zilReserve,
          tokenReserve,
          foundToken.decimals
        );
      } catch {
        continue;
      }
    }

    await BrowserStorage.set(
      buildObject(this.field, this.identities)
    );
  }
}
