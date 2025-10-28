import type { BackgroundState, IWeb3ConnectionState, Wallet } from "background/storage";
import { ConfirmState } from "background/storage/confirm";
import { ZILLIQA } from "config/slip44";
import { MTypePopup } from "config/stream";
import { Address } from "crypto/address";
import { PromptService } from "lib/popup/prompt";
import type { StreamResponse } from "lib/streem";
import { TabsMessage } from "lib/streem/tabs-message";
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

      wallet.confirm.push(new ConfirmState({
        uuid: payload.uuid,
        connect: payload,
      }));

      await this.#state.sync();
      new PromptService().open("/connect");

      sendResponse({ reject: "wallet not enabled" });
    } catch (error) {
      sendResponse({ reject: String(error) });
    }
  }

  async responseConnect(
    uuid: string,
    walletIndex: number,
    approve: boolean,
    sendResponse: StreamResponse,
  ): Promise<void> {
    try {
      const wallet = this.#state.wallets[walletIndex];
      const confirmRequest = this.#findConfirmRequest(wallet, uuid);

      this.#removeConfirmRequest(wallet, uuid);

      if (approve && confirmRequest?.connect) {
        this.#handleConnection(wallet, confirmRequest.connect);
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

  #handleConnection(wallet: Wallet, connect: ConnectParams): void {
    const connection = this.#findConnection(connect.domain);

    if (connection) {
      this.#updateConnection(connection, wallet, connect);
    } else {
      this.#createConnection(wallet, connect);
    }
  }

  #findConnection(domain: string): IWeb3ConnectionState | undefined {
    return this.#state.connections.list.find(c => c.domain === domain);
  }

  #updateConnection(connection: IWeb3ConnectionState, wallet: Wallet, connect: ConnectParams): void {
    connection.title = connect.title;
    connection.icon = connect.icon;

    this.#addAccountToConnection(connection, wallet.selectedAccount);
    this.#addChainToConnection(connection, wallet.defaultChainHash);
  }

  #addAccountToConnection(connection: IWeb3ConnectionState, accountIndex: number): void {
    if (!connection.connectedAccounts.includes(accountIndex)) {
      connection.connectedAccounts.push(accountIndex);
    }
  }

  #addChainToConnection(connection: IWeb3ConnectionState, chainHash: number): void {
    const chainIndex = this.#findChainIndex(chainHash);
    if (chainIndex !== -1 && !connection.connectedChains.includes(chainIndex)) {
      connection.connectedChains.push(chainIndex);
    }
  }

  #createConnection(wallet: Wallet, connect: ConnectParams): void {
    const chainIndex = this.#findChainIndex(wallet.defaultChainHash);

    this.#state.connections.add({
      origin: connect.domain,
      domain: connect.domain,
      title: connect.title,
      icon: connect.icon,
      permissions: this.#getDefaultPermissions(),
      connectedAccounts: [wallet.selectedAccount],
      connectedChains: chainIndex !== -1 ? [chainIndex] : [],
      connectedAt: Date.now(),
    });
  }

  #getDefaultPermissions() {
    return {
      accounts: true,
      signTransactions: true,
      signMessages: true,
      readChainData: true,
    };
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

  async #buildDappPayload(uuid: string, selectedAccount: any) {
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
