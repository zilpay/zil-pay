/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2022 ZilPay
 */
import type { ZilliqaControl } from 'core/background/services/blockchain';
import type { NetworkControl } from 'core/background/services/network';
import type { DexState } from 'types/dex';

import assert from 'assert';

import { Methods } from 'core/background/services/blockchain';
import { tohexString } from 'lib/utils/address';

import { BrowserStorage, buildObject } from 'lib/storage';

import { Fields } from 'config/fields';
import { ErrorMessages } from 'config/errors';
import { SLIPPAGE, BLOCKS } from 'config/dex';
import { TypeOf } from 'lib/type/type-checker';
import { NETWORK_KEYS } from 'config/network';


export enum ZRC2Fields {
  Balances = 'balances',
  Allowances = 'allowances',
  Pools = 'pools',
  LiquidityFee = 'liquidity_fee',
  ProtocolFee = 'protocol_fee'
}


const [mainnet, testnet, custom] = NETWORK_KEYS;
const INIT_STATE: DexState = {
  liquidityFee: 0,
  protocolFee: 0,
  slippage: SLIPPAGE,
  blocks: BLOCKS,
  contract: {
    [mainnet]: '',
    [testnet]: '0x359d0def766c0e27acc1af30cf8c6ae02a06de81',
    [custom]: ''
  }
};

export class DexController {
  readonly #zilliqa: ZilliqaControl;
  readonly #network: NetworkControl;

  #state: DexState = INIT_STATE;

  public get state() {
    return this.#state;
  }

  public get contract() {
    return this.state.contract[this.#network.selected];
  }

  constructor(zilliqa: ZilliqaControl, network: NetworkControl) {
    this.#zilliqa = zilliqa;
    this.#network = network;
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
        [tohexString(this.contract), ZRC2Fields.LiquidityFee, []]
      ),
      this.#zilliqa.provider.buildBody(
        Methods.GetSmartContractSubState,
        [tohexString(this.contract), ZRC2Fields.ProtocolFee, []]
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
