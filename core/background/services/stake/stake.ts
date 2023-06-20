/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2023 ZilPay
 */
import type { ZRC2Controller } from 'core/background/services/token';
import type { AccountController } from 'core/background/services/account';
import type { RPCResponse } from 'types/zilliqa';
import type { StakeResponse } from 'types/stake';

import assert from 'assert';

import { stZIL } from 'core/background/services/token';
import { ErrorMessages } from 'config/errors';
import { tohexString } from 'lib/utils/address';

import { Methods, ZilliqaControl } from 'core/background/services/blockchain';


export enum STZILFields {
  LocalBnumReq = 'local_bnum_req',
  RewardsFee = 'rewards_fee',
  TotalSupply = 'total_supply',
  TotalStakeAmount = 'totalstakeamount',
  WithdrawalPendingOfDelegator = 'withdrawal_pending_of_delegator',
  WithdrawalUnbonded = 'withdrawal_unbonded'
}

export class StakeController {
  readonly #zilliqa: ZilliqaControl;
  readonly #account: AccountController;
  readonly #zrc2: ZRC2Controller;

  get stZIL() {
    return this.#zrc2.identities.find((t) => stZIL.symbol === t.symbol);
  }


  constructor(
    zilliqa: ZilliqaControl,
    zrc2: ZRC2Controller,
    account: AccountController
  ) {
    this.#zilliqa = zilliqa;
    this.#zrc2 = zrc2;
    this.#account = account;
  }


  async request(): Promise<StakeResponse> {
    const { base16 } = this.#account.selectedAccount;

    assert(Boolean(base16), ErrorMessages.InvalidBech32);
    assert(Boolean(this.stZIL), `${ErrorMessages.IncorrectParams}: ${stZIL.name}`);

    const contract = tohexString(this.stZIL.base16);
    const address = base16.toLowerCase();
    const batch = [
      this.#zilliqa.provider.buildBody(
        Methods.GetSmartContractSubState,
        [contract, STZILFields.LocalBnumReq, []]
      ),
      this.#zilliqa.provider.buildBody(
        Methods.GetSmartContractSubState,
        [contract, STZILFields.RewardsFee, []]
      ),
      this.#zilliqa.provider.buildBody(
        Methods.GetSmartContractSubState,
        [contract, STZILFields.TotalSupply, []]
      ),
      this.#zilliqa.provider.buildBody(
        Methods.GetSmartContractSubState,
        [contract, STZILFields.TotalStakeAmount, []]
      ),
      this.#zilliqa.provider.buildBody(
        Methods.GetSmartContractSubState,
        [contract, STZILFields.WithdrawalPendingOfDelegator, [address]]
      ),
      this.#zilliqa.provider.buildBody(
        Methods.GetSmartContractSubState,
        [contract, STZILFields.WithdrawalUnbonded, [address]]
      )
    ];
    const replies: RPCResponse[] = await this.#zilliqa.sendJson(...batch);

    const block = Number(replies[0].result[STZILFields.LocalBnumReq]);
    const fee = Number(replies[1].result[STZILFields.RewardsFee]);
    const totalSupply = String(replies[2].result[STZILFields.TotalSupply]);
    const totalStaked = String(replies[3].result[STZILFields.TotalStakeAmount]);

    const pendingOrders = this.#getPendingOrders(
      replies[4].result,
      address
    );
    const unbounded = this.#getUnbounded(
      replies[5].result,
      address
    );

    return {
      block,
      fee,
      totalSupply,
      totalStaked,
      pendingOrders,
      unbounded
    };
  }

  #getUnbounded(mbOrders: object | null, address: string) {
    if (!mbOrders || !address || !mbOrders[STZILFields.WithdrawalUnbonded]) {
      return [];
    }

    const order = mbOrders[STZILFields.WithdrawalUnbonded][address];

    if (!order) {
      return [];
    }

    return [{
      st: String(order.arguments[0]),
      zil: String(order.arguments[1])
    }];
  }

  #getPendingOrders(mbOrders: object | null, address: string) {
    if (!mbOrders || !address || !mbOrders[STZILFields.WithdrawalPendingOfDelegator]) {
      return [];
    }

    const orders = mbOrders[STZILFields.WithdrawalPendingOfDelegator][address];
    const blocks = Object.keys(orders);

    if (blocks.length === 0) {
      return[];
    }

    return blocks.map((block) => ({
      block: String(block),
      st: String(orders[block].arguments[0]),
      zil: String(orders[block].arguments[1])
    }));
  }
}
