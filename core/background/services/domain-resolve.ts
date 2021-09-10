/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */

/**
 * Unstoppabledomains service domain resolver.
 * [more info](http://unstoppabledomains.com/)
 */
import { ZilliqaControl } from './blockchain';
import { NetworkControl } from './network';
import { IPFS } from './ipfs';
import { Contracts } from 'config/contracts';
import { fromBech32Address } from 'lib/utils/bech32';
import type { DomainResolver } from 'types/domain';
import { nameHash } from 'lib/utils/namehash';

export class UnstoppableDomains {
  private _field = 'records';
  private _zilliqa: ZilliqaControl;
  private _netwrok: NetworkControl;
  private _ipfs: IPFS;

  constructor() {
    this._ipfs = new IPFS();
    this._netwrok = new NetworkControl(true);
    this._zilliqa = new ZilliqaControl(this._netwrok);
  }

  public async getAddressByDomain(domain: string): Promise<DomainResolver> {
    await this._netwrok.sync();
    domain = String(domain).toLowerCase();

    const domainHash: string = nameHash(domain);
    const zilRecords = 'crypto.ZIL.address';
    const { records } = await this._zilliqa.getSmartContractSubState(
      Contracts.UD,
      this._field,
      [domainHash]
    );

    const [owner, resolver] = records[domainHash].arguments;
    let address = null;

    if (resolver && resolver !== Contracts.ZERO_ADDRESS) {
      const result = await this._zilliqa.getSmartContractSubState(
        resolver,
        this._field,
        [zilRecords]
      );

      if (result && result[this._field][zilRecords]) {
        address = result[this._field][zilRecords];
      }

      try {
        address = fromBech32Address(address);
      } catch {
        ///
      }
    }

    return {
      owner,
      address,
      domain
    };
  }
}