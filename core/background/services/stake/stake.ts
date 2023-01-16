/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2023 ZilPay
 */
import type { NetworkControl } from 'core/background/services/network';
import type { ZRC2Controller } from 'core/background/services/token';
import type { AccountController } from 'core/background/services/account';

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


  async request() {
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
    let replies = await this.#zilliqa.sendJson(...batch);

    console.log(replies);
  }
}
