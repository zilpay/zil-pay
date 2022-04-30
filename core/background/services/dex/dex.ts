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

import { Methods } from 'core/background/services/blockchain';
import { tohexString } from 'lib/utils/address';

import { BrowserStorage, buildObject } from 'lib/storage';

import { Contracts } from 'config/contracts';
import { Fields } from 'config/fields';
import { ErrorMessages } from 'config/errors';

export enum ZRC2Fields {
  Balances = 'balances',
  Pools = 'pools',
  LiquidityFee = 'liquidity_fee',
  ProtocolFee = 'protocol_fee'
}

export class DexController {
  readonly #zilliqa: ZilliqaControl;

  public state = {
    liquidityFee: 0,
    protocolFee: 0
  };

  constructor(zilliqa: ZilliqaControl) {
    this.#zilliqa = zilliqa;
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

    this.state.liquidityFee = Number(replies[0].result[ZRC2Fields.LiquidityFee]);
    this.state.protocolFee = Number(replies[1].result[ZRC2Fields.ProtocolFee]);

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

      this.state = JSON.parse(String(data));
    } catch {
      await this.reset();
    }
  }

  public async reset() {
    await BrowserStorage.set(
      buildObject(Fields.DEX, {
        liquidityFee: 0,
        protocolFee: 0
      })
    );
  }
}
