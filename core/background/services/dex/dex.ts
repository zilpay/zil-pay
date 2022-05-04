/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2022 ZilPay
 */
import type { ZilliqaControl } from 'core/background/services/blockchain';

import assert from 'assert';

import type { DexState } from 'types/dex';

import { Methods } from 'core/background/services/blockchain';
import { tohexString } from 'lib/utils/address';

import { BrowserStorage, buildObject } from 'lib/storage';

import { Contracts } from 'config/contracts';
import { Fields } from 'config/fields';
import { ErrorMessages } from 'config/errors';
import { SLIPPAGE, BLOCKS } from 'config/dex';
import { TypeOf } from 'lib/type/type-checker';

export enum ZRC2Fields {
  Balances = 'balances',
  Allowances = 'allowances',
  Pools = 'pools',
  LiquidityFee = 'liquidity_fee',
  ProtocolFee = 'protocol_fee'
}

const INIT_STATE: DexState = {
  liquidityFee: 0,
  protocolFee: 0,
  slippage: SLIPPAGE,
  blocks: BLOCKS
};

export class DexController {
  readonly #zilliqa: ZilliqaControl;

  #state: DexState = INIT_STATE;

  public get state() {
    return this.#state;
  }

  constructor(zilliqa: ZilliqaControl) {
    this.#zilliqa = zilliqa;
  }

  public async setSettings(blocks: number, slippage: number) {
    assert(TypeOf.isNumber(blocks), ErrorMessages.IncorrectParams);
    assert(TypeOf.isNumber(slippage), ErrorMessages.IncorrectParams);
    assert(slippage >= 0, ErrorMessages.IncorrectParams);
    assert(blocks > 0, ErrorMessages.IncorrectParams);

    this.#state.blocks = blocks;
    this.#state.slippage = slippage;

    await BrowserStorage.set(
      buildObject(Fields.DEX, this.state)
    );
  }

  public async updateState() {
    const batch = [
      this.#zilliqa.provider.buildBody(
        Methods.GetSmartContractSubState,
        [tohexString(Contracts.SWAP), ZRC2Fields.LiquidityFee, []]
      ),
      this.#zilliqa.provider.buildBody(
        Methods.GetSmartContractSubState,
        [tohexString(Contracts.SWAP), ZRC2Fields.ProtocolFee, []]
      )
    ];
    let replies = await this.#zilliqa.sendJson(...batch);
    
    assert(Array.isArray(replies), `${ErrorMessages.MustBe} array`);

    this.#state.liquidityFee = Number(replies[0].result[ZRC2Fields.LiquidityFee]);
    this.#state.protocolFee = Number(replies[1].result[ZRC2Fields.ProtocolFee]);

    await BrowserStorage.set(
      buildObject(Fields.DEX, this.state)
    );

    return this.state;
  }

  public async sync() {
    const data = await BrowserStorage.get(Fields.DEX);

    try {
      if (!data) {
        throw new Error();
      }

      const parsed = JSON.parse(String(data));

      this.#state = {
        ...INIT_STATE,
        ...parsed
      };
    } catch {
      await this.reset();
    }
  }

  public async reset() {
    await BrowserStorage.set(
      buildObject(Fields.DEX, INIT_STATE)
    );
  }
}
