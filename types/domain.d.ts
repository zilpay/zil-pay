/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */

export interface DomainResolver {
  owner: {
    base16: string;
    bech32: string;
  };
  address?: {
    base16: string;
    bech32: string;
  };
  domain: string;
}
