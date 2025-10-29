import type { Account, BackgroundState, IWeb3ConnectionPermissions, IWeb3ConnectionState, Wallet } from "background/storage";
import { ConfirmState } from "background/storage/confirm";
import { ConnectError } from "config/errors";
import { ZILLIQA } from "config/slip44";
import { MTypePopup } from "config/stream";
import { Address } from "crypto/address";
import { PromptService } from "lib/popup/prompt";
import type { StreamResponse } from "lib/streem";
import { TabsMessage } from "lib/streem/tabs-message";
import { hashXOR } from "lib/utils/hashing";
import { hexToUint8Array } from "lib/utils/hex";
import type { ConnectParams } from "types/connect";

export class ConnectService {
  #state: BackgroundState;

  constructor(state: BackgroundState) {
    this.#state = state;
  }

  async callConnect(
    payload: ConnectParams,
    sendResponse: StreamResponse,
  ): Promise<void> {
    try {
      const wallet = this.#state.wallets[this.#state.selectedWallet];

      if (!wallet) {
        throw new Error(ConnectError.WalletNotFound);
      }

      await wallet.trhowSession();
      const isConnected = this.#state.connections.isConnected(payload.domain, wallet.selectedAccount);

      if (isConnected) {
        await this.#notifyDapp(wallet, payload.uuid, payload);
        sendResponse({ resolve: true });
        return;
      }

      wallet.confirm.push(new ConfirmState({
        uuid: payload.uuid,
        connect: payload,
      }));

      await this.#state.sync();
      new PromptService().open("/connect");

      sendResponse({ resolve: true });
    } catch (error) {
      new TabsMessage({
        type: MTypePopup.RESPONSE_TO_DAPP,
        uuid: payload.uuid,
        payload: {
          reject: String(error) ,
          uuid: payload.uuid,
        },
      }).send(payload.domain);
      sendResponse({ reject: String(error) });
    }
  }

  async disconectWallet(
    domain: string,
    walletIndex: number,
    sendResponse: StreamResponse,
  ): Promise<void> {
    try {
      const wallet = this.#state.wallets[walletIndex];
      
      if (!wallet) {
        throw new Error(ConnectError.WalletNotFound);
      }

      await wallet.trhowSession();

      wallet.accounts.forEach((a) => {
        const pubkey = hexToUint8Array(a.pubKey);
        const hash = hashXOR(pubkey);

        this.#state.connections.removeAccount(domain, hash);
      });
      const connection = this.#state.connections.find(domain);

      if (connection?.connectedAccounts.length == 0) {
        this.#state.connections.remove(domain);
      }

      await this.#state.sync();

      sendResponse({ resolve: this.#state.connections.list });
    } catch (error) {
      sendResponse({ reject: String(error) });
    }
  }

  async responseConnect(
    uuid: string,
    walletIndex: number,
    approve: boolean,
    permissions: IWeb3ConnectionPermissions,    
    sendResponse: StreamResponse,
  ): Promise<void> {
    try {
      const wallet = this.#state.wallets[walletIndex];

      if (!wallet) {
        throw new Error(ConnectError.WalletNotFound);
      }

      await wallet.trhowSession();
      const confirmRequest = this.#findConfirmRequest(wallet, uuid);

      this.#removeConfirmRequest(wallet, uuid);

      if (approve && confirmRequest?.connect) {
        this.#handleConnection(wallet, confirmRequest.connect, permissions);
      }

      await this.#state.sync();

      if (confirmRequest?.connect) {
        await this.#notifyDapp(wallet, uuid, confirmRequest.connect);
      }

      sendResponse({ resolve: wallet.confirm });
    } catch (error) {
      sendResponse({ reject: String(error) });
    }
  }

  #findConfirmRequest(wallet: Wallet, uuid: string) {
    return wallet.confirm.find(c => c.uuid === uuid);
  }

  #removeConfirmRequest(wallet: Wallet, uuid: string): void {
    wallet.confirm = wallet.confirm.filter(c => c.uuid !== uuid);
  }

  #handleConnection(wallet: Wallet, connect: ConnectParams, permissions: IWeb3ConnectionPermissions): void {
    const connection = this.#findConnection(connect.domain);

    if (connection) {
      this.#updateConnection(connection, wallet, connect);
    } else {
      this.#createConnection(wallet, connect, permissions);
    }
  }

  #findConnection(domain: string): IWeb3ConnectionState | undefined {
    return this.#state.connections.list.find(c => c.domain === domain);
  }

  #updateConnection(connection: IWeb3ConnectionState, wallet: Wallet, connect: ConnectParams): void {
    connection.title = connect.title;
    connection.icon = connect.icon;

    const selectedAccount = wallet.accounts[wallet.selectedAccount];

    wallet.accounts.forEach((a) => {
      this.#addAccountToConnection(connection, a);
    });

    this.#addChainToConnection(connection, selectedAccount.chainHash);
  }

  #addAccountToConnection(connection: IWeb3ConnectionState, account: Account): void {
    const pubkey = hexToUint8Array(account.pubKey);
    const hash = hashXOR(pubkey);
    if (!connection.connectedAccounts.includes(hash)) {
      connection.connectedAccounts.push(hash);
    }
  }

  #addChainToConnection(connection: IWeb3ConnectionState, chainHash: number): void {
    const chainIndex = this.#findChainIndex(chainHash);
    if (chainIndex !== -1 && !connection.connectedChains.includes(chainIndex)) {
      connection.connectedChains.push(chainIndex);
    }
  }

  #createConnection(wallet: Wallet, connect: ConnectParams, permissions: IWeb3ConnectionPermissions): void {
    const chainIndex = this.#findChainIndex(wallet.defaultChainHash);
    const connection = {
      permissions,
      origin: connect.domain,
      domain: connect.domain,
      title: connect.title,
      icon: connect.icon,
      connectedAccounts: [],
      connectedChains: chainIndex !== -1 ? [chainIndex] : [],
      connectedAt: Date.now(),
    };

    wallet.accounts.forEach((a) => {
      this.#addAccountToConnection(connection, a);
    });

    this.#state.connections.add(connection);
  }

  #findChainIndex(chainHash: number): number {
    return this.#state.chains.findIndex(c => c.hash() === chainHash);
  }

  async #notifyDapp(wallet: Wallet, uuid: string, connect: ConnectParams): Promise<void> {
    const selectedAccount = wallet.accounts[wallet.selectedAccount];
    if (!selectedAccount) return;

    const payload = await this.#buildDappPayload(uuid, selectedAccount);

    new TabsMessage({
      type: MTypePopup.RESPONSE_TO_DAPP,
      payload,
    }).send(connect.domain);
  }

  async #buildDappPayload(uuid: string, selectedAccount: Account) {
    let payload: object = { uuid };

    if (selectedAccount.slip44 === ZILLIQA) {
      const addresses = await this.#getZilliqaAddresses(selectedAccount.addr);
      payload = { ...payload, account: addresses };
    }

    return payload;
  }

  async #getZilliqaAddresses(addrStr: string) {
    const addr = Address.fromStr(addrStr.split(":")[0]);
    return {
      base16: await addr.toZilChecksum(),
      bech32: await addr.toZilBech32(),
    };
  }
}
