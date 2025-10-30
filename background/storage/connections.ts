export interface IWeb3ConnectionPermissions {
  signTransactions: boolean;
  signMessages: boolean;
  readChainData: boolean;
}

export interface IWeb3ConnectionState {
  origin: string;
  domain: string;
  title: string;
  icon?: string;
  permissions: IWeb3ConnectionPermissions;
  connectedAccounts: number[];
  connectedChains: number[];
  connectedAt: number;
}

export interface IWeb3ConnectionsState {
  list: IWeb3ConnectionState[];
}

export class Web3Connections implements IWeb3ConnectionsState {
  list: IWeb3ConnectionState[];

  constructor(state: IWeb3ConnectionsState) {
    this.list = [];
    if (state && state.list) {
      this.list = state.list.map(connection => ({
        ...connection,
        connectedChains: Array.from(new Set(connection.connectedChains))
      }));
    }
  }

  find(domain: string): IWeb3ConnectionState | undefined {
    return this.list.find(c => c.domain === domain);
  }

  #findIndex(domain: string): number {
    return this.list.findIndex(c => c.domain === domain);
  }

  isConnected(origin: string, accountHash?: number): boolean {
    const connection = this.find(origin);
    if (!connection) return false;
    if (accountHash !== undefined) {
      return connection.connectedAccounts.includes(accountHash);
    }
    return connection.connectedAccounts.length > 0;
  }

  getConnectedAccounts(origin: string): number[] {
    return this.find(origin)?.connectedAccounts || [];
  }

  getConnectedChains(origin: string): number[] {
    return this.find(origin)?.connectedChains || [];
  }

  getPermissions(origin: string): IWeb3ConnectionPermissions | null {
    return this.find(origin)?.permissions || null;
  }

  isAccountConnected(origin: string, accountHash: number): boolean {
    return this.find(origin)?.connectedAccounts.includes(accountHash) || false;
  }

  isChainConnected(origin: string, chainHash: number): boolean {
    return this.find(origin)?.connectedChains.includes(chainHash) || false;
  }

  add(payload: IWeb3ConnectionState): void {
    const normalizedPayload = {
      ...payload,
      connectedChains: Array.from(new Set(payload.connectedChains))
    };

    const idx = this.#findIndex(normalizedPayload.origin);
    if (idx !== -1) {
      this.list[idx] = normalizedPayload;
    } else {
      this.list.push(normalizedPayload);
    }
  }

  remove(domain: string): void {
    const idx = this.#findIndex(domain);
    if (idx !== -1) {
      this.list.splice(idx, 1);
    }
  }

  addAccount(origin: string, accountHash: number): void {
    const connection = this.find(origin);
    if (!connection) throw new Error(`Connection not found: ${origin}`);
    if (!connection.connectedAccounts.includes(accountHash)) {
      connection.connectedAccounts.push(accountHash);
    }
  }

  removeAccount(domain: string, accountHash: number): void {
    const connection = this.find(domain);
    if (!connection) return;
    
    connection.connectedAccounts = connection.connectedAccounts.filter(idx => idx !== accountHash);
    
    if (connection.connectedAccounts.length === 0) {
      this.remove(domain);
    }
  }

  addChain(origin: string, chainHash: number): void {
    const connection = this.find(origin);
    if (!connection) throw new Error(`Connection not found: ${origin}`);
    if (!connection.connectedChains.includes(chainHash)) {
      connection.connectedChains.push(chainHash);
    }
  }

  removeChain(origin: string, chainHash: number): void {
    const connection = this.find(origin);
    if (!connection) return;
    connection.connectedChains = connection.connectedChains.filter(hash => hash !== chainHash);
  }

  updatePermissions(origin: string, permissions: Partial<IWeb3ConnectionPermissions>): void {
    const connection = this.find(origin);
    if (!connection) throw new Error(`Connection not found: ${origin}`);
    connection.permissions = { ...connection.permissions, ...permissions };
  }

  getAll(): IWeb3ConnectionState[] {
    return this.list;
  }

  removeByAccount(accountHash: number): void {
    for (const connection of this.list) {
      this.removeAccount(connection.origin, accountHash);
    }
  }

  removeByChain(chainHash: number): void {
    for (const connection of this.list) {
      this.removeChain(connection.origin, chainHash);
    }
  }

  getByAccount(accountHash: number): IWeb3ConnectionState[] {
    return this.list.filter(c => c.connectedAccounts.includes(accountHash));
  }

  getByChain(chainHash: number): IWeb3ConnectionState[] {
    return this.list.filter(c => c.connectedChains.includes(chainHash));
  }

  toJSON(): IWeb3ConnectionsState {
    return {
      list: this.list
    };
  }
}
