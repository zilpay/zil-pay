import type { Account, BackgroundState, IWeb3ConnectionPermissions, IWeb3ConnectionState, Wallet } from "background/storage";
import { ConfirmState } from "background/storage/confirm";
import { ConnectError } from "config/errors";
import { ZILLIQA } from "config/slip44";
import { MTypePopup } from "config/stream";
import { Address } from "crypto/address";
import { PromptService } from "lib/popup/prompt";
import type { StreamResponse } from "lib/streem";
import { TabsMessage } from "lib/streem/tabs-message";
import { hashXOR, hashXORHex } from "lib/utils/hashing";
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
      const account = wallet.accounts[wallet.selectedAccount];
      const hash = hashXORHex(account.pubKey);
      const isConnected = this.#state.connections.isConnected(payload.domain, hash);

      if (isConnected) {
        switch (payload.type) {
          case MTypePopup.EVM_REQUEST:
            await this.#notifyDappEVM(wallet, payload.uuid, true, payload);
            break;
          case MTypePopup.CONNECT_APP:
            await this.#notifyDappLegacy(wallet, payload.uuid, true, payload);
            break;
        }
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
      switch (payload.type) {
        case MTypePopup.EVM_REQUEST:
          new TabsMessage({
            type: MTypePopup.EVM_RESPONSE,
            uuid: payload.uuid,
            payload: {
              error: {
                message: String(error),
                code: 4001,
                data: null
              }
            },
          }).send(payload.domain);
          break;
        case MTypePopup.CONNECT_APP:
          new TabsMessage({
            type: MTypePopup.RESPONSE_TO_DAPP,
            uuid: payload.uuid,
            payload: {
              reject: String(error) ,
              uuid: payload.uuid,
            },
          }).send(payload.domain);
          break;
      }
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
      const selectedAccount = wallet.accounts[wallet.selectedAccount];

      this.#removeConfirmRequest(wallet, uuid);

      if (approve && confirmRequest?.connect) {
        this.#handleConnection(wallet, selectedAccount, confirmRequest.connect, permissions);
      }

      await this.#state.sync();

      if (confirmRequest?.connect) {
        await this.#notifyDappLegacy(wallet, uuid, approve, confirmRequest.connect);
        await this.#notifyDappEVM(wallet, uuid, approve, confirmRequest.connect);
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

  #handleConnection(wallet: Wallet, account: Account, connect: ConnectParams, permissions: IWeb3ConnectionPermissions): void {
    const connection = this.#findConnection(connect.domain);

    if (connection) {
      this.#updateConnection(connection, wallet, connect);
    } else {
      this.#createConnection(wallet, account, connect, permissions);
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

  #createConnection(wallet: Wallet, account: Account, connect: ConnectParams, permissions: IWeb3ConnectionPermissions): void {
    const connection = {
      permissions,
      origin: connect.domain,
      domain: connect.domain,
      title: connect.title,
      icon: connect.icon,
      connectedAccounts: [],
      connectedChains: [account.chainHash],
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

  async #notifyDappLegacy(wallet: Wallet, uuid: string, approved: boolean, connect: ConnectParams): Promise<void> {
    const selectedAccount = wallet.accounts[wallet.selectedAccount];
    if (!selectedAccount) return;

    const payload = await this.#buildDappPayload(uuid, approved, selectedAccount);

    new TabsMessage({
      type: MTypePopup.RESPONSE_TO_DAPP,
      payload,
    }).send(connect.domain);
  }

  async #notifyDappEVM(wallet: Wallet, uuid: string, approved: boolean, connect: ConnectParams): Promise<void> {
    const selectedAccount = wallet.accounts[wallet.selectedAccount];
    if (!selectedAccount) return;

    if (!approved) {
      new TabsMessage({
        type: MTypePopup.EVM_RESPONSE,
        uuid,
        payload: {
          error: {
            message: ConnectError.UserRejected,
            code: 4001,
            data: null,
          },
        },
      }).send(connect.domain);

      return;
    }

    const addresses = wallet.accounts
      .slice()
      .sort((a, _b) => a.addr === selectedAccount.addr ? -1 : 1)
      .map((a) => a.slip44 === ZILLIQA ? a.addr.split(":")[1] : a.addr);

    new TabsMessage({
      type: MTypePopup.EVM_RESPONSE,
      uuid,
      payload: {
        result: addresses,
      },
    }).send(connect.domain);
  }

  async #buildDappPayload(uuid: string, approved: boolean, selectedAccount: Account) {
    let payload: object = { uuid };

    if (approved && selectedAccount.slip44 === ZILLIQA) {
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
