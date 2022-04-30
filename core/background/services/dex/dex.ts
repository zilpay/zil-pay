/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2022 ZilPay
 */
import type { NetworkControl } from 'core/background/services/network';
import type { ZilliqaControl } from 'core/background/services/blockchain';

import { Methods } from 'core/background/services/blockchain';

export class DexController {
  readonly #netwrok: NetworkControl;
  readonly #zilliqa: ZilliqaControl;

  constructor(
    netwrok: NetworkControl,
    zilliqa: ZilliqaControl
  ) {
    this.#netwrok = netwrok;
    this.#zilliqa = zilliqa;
  }
}
