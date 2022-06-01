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
import { Contracts } from 'config/contracts';


export enum ZRC2Fields {
  Balances = 'balances',
  Allowances = 'allowances',
  Pools = 'pools',
  LiquidityFee = 'liquidity_fee',
  ProtocolFee = 'protocol_fee',
  RewardsPool = 'rewards_pool'
}


const [mainnet, testnet, custom] = NETWORK_KEYS;
const INIT_STATE: DexState = {
  liquidityFee: 0,
  protocolFee: 0,
  slippage: SLIPPAGE,
  blocks: BLOCKS,
  rewarded: Contracts.ZERO_ADDRESS,
  contract: {
    [mainnet]: '0x30dfe64740ed459ea115b517bd737bbadf21b838',
    [testnet]: '0xb0c677b5ba660925a8f1d5d9687d0c2c379e16ee',
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
    const contract = tohexString(this.contract);
    const batch = [
      this.#zilliqa.provider.buildBody(
        Methods.GetSmartContractSubState,
        [contract, ZRC2Fields.LiquidityFee, []]
      ),
      this.#zilliqa.provider.buildBody(
        Methods.GetSmartContractSubState,
        [contract, ZRC2Fields.ProtocolFee, []]
      ),
      this.#zilliqa.provider.buildBody(
        Methods.GetSmartContractSubState,
        [contract, ZRC2Fields.RewardsPool, []]
      )
    ];
    let replies = await this.#zilliqa.sendJson(...batch);
    
    assert(Array.isArray(replies), `${ErrorMessages.MustBe} array`);

    this.#state.liquidityFee = Number(replies[0].result[ZRC2Fields.LiquidityFee]);
    this.#state.protocolFee = Number(replies[1].result[ZRC2Fields.ProtocolFee]);
    this.#state.rewarded = replies[2].result[ZRC2Fields.RewardsPool];

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
        ...parsed,
        contract: INIT_STATE.contract
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
