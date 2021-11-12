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
import type { DomainResolver } from 'types/domain';
import { ZilliqaControl } from './blockchain';
import { NetworkControl } from './network';
import { Contracts } from 'config/contracts';
import { fromBech32Address, toBech32Address } from 'lib/utils/bech32';
import { nameHash } from 'lib/utils/namehash';

export class UnstoppableDomains {
  #field = 'records';
  readonly #zilliqa: ZilliqaControl;
  readonly #netwrok: NetworkControl;

  constructor() {
    this.#netwrok = new NetworkControl();
    this.#zilliqa = new ZilliqaControl(this.#netwrok);
  }

  public async getAddressByDomain(domain: string): Promise<DomainResolver> {
    await this.#netwrok.sync();
    domain = String(domain).toLowerCase();

    const domainHash: string = nameHash(domain);
    const zilRecords = 'crypto.ZIL.address';
    const { records } = await this.#zilliqa.getSmartContractSubState(
      Contracts.UD,
      this.#field,
      [domainHash]
    );

    const [owner, resolver] = records[domainHash].arguments;
    let resolve = null;
    let address = undefined;

    if (resolver && resolver !== Contracts.ZERO_ADDRESS) {
      const result = await this.#zilliqa.getSmartContractSubState(
        resolver,
        this.#field,
        [zilRecords]
      );

      if (result && result[this.#field][zilRecords]) {
        resolve = result[this.#field][zilRecords];
      }

      try {
        address = {
          base16: fromBech32Address(resolve),
          bech32: resolve
        };
      } catch {
        ///
      }
      try {
        address = {
          base16: resolve,
          bech32: toBech32Address(resolve)
        };
      } catch {
        ///
      }
    }

    return {
      owner: {
        base16: owner,
        bech32: toBech32Address(owner)
      },
      address,
      domain
    };
  }
}