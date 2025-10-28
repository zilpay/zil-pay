import { describe, it, expect, beforeEach } from 'vitest';
import { 
  Web3Connections, 
  type IWeb3ConnectionsState, 
  type IWeb3ConnectionState,
} from '../../background/storage/connections';

describe('Web3Connections', () => {
  let connections: Web3Connections;
  
  const mockConnection: IWeb3ConnectionState = {
    origin: 'https://example.com',
    domain: 'example.com',
    title: 'Example Site',
    icon: 'https://example.com/icon.png',
    permissions: {
      signTransactions: true,
      signMessages: true,
      readChainData: true
    },
    connectedAccounts: [0, 1],
    connectedChains: [0],
    connectedAt: Date.now()
  };

  const mockConnection2: IWeb3ConnectionState = {
    origin: 'https://test.com',
    domain: 'test.com',
    title: 'Test Site',
    permissions: {
      signTransactions: false,
      signMessages: true,
      readChainData: true
    },
    connectedAccounts: [2],
    connectedChains: [1, 2],
    connectedAt: Date.now()
  };

  beforeEach(() => {
    connections = new Web3Connections({ list: [] });
  });

  describe('constructor', () => {
    it('should initialize with empty list', () => {
      expect(connections.list).toEqual([]);
    });

    it('should initialize with provided list', () => {
      const state: IWeb3ConnectionsState = {
        list: [mockConnection]
      };
      connections = new Web3Connections(state);
      expect(connections.list).toHaveLength(1);
      expect(connections.list[0]).toEqual(mockConnection);
    });

    it('should handle undefined list', () => {
      const state = { list: undefined } as any;
      connections = new Web3Connections(state);
      expect(connections.list).toEqual([]);
    });
  });

  describe('find', () => {
    it('should find connection by domain', () => {
      connections.add(mockConnection);
      expect(connections.find('example.com')).toEqual(mockConnection);
    });

    it('should return undefined for non-existing domain', () => {
      expect(connections.find('unknown.com')).toBeUndefined();
    });
  });

  describe('isConnected', () => {
    beforeEach(() => {
      connections.add(mockConnection);
    });

    it('should return true for connected domain', () => {
      expect(connections.isConnected('example.com')).toBe(true);
    });

    it('should return false for non-connected domain', () => {
      expect(connections.isConnected('unknown.com')).toBe(false);
    });

    it('should return true for connected domain with specific account', () => {
      expect(connections.isConnected('example.com', 0)).toBe(true);
      expect(connections.isConnected('example.com', 1)).toBe(true);
    });

    it('should return false for connected domain with non-connected account', () => {
      expect(connections.isConnected('example.com', 5)).toBe(false);
    });

    it('should return false if no accounts connected', () => {
      const emptyConnection = { 
        ...mockConnection, 
        origin: 'https://empty.com',
        domain: 'empty.com',
        connectedAccounts: [] 
      };
      connections.add(emptyConnection);
      expect(connections.isConnected('empty.com')).toBe(false);
    });
  });

  describe('getConnectedAccounts', () => {
    it('should return connected accounts for domain', () => {
      connections.add(mockConnection);
      expect(connections.getConnectedAccounts('example.com')).toEqual([0, 1]);
    });

    it('should return empty array for non-existing domain', () => {
      expect(connections.getConnectedAccounts('unknown.com')).toEqual([]);
    });

    it('should return empty array when no accounts connected', () => {
      const emptyConnection = { ...mockConnection, connectedAccounts: [] };
      connections.add(emptyConnection);
      expect(connections.getConnectedAccounts('example.com')).toEqual([]);
    });
  });

  describe('getConnectedChains', () => {
    it('should return connected chains for domain', () => {
      connections.add(mockConnection);
      expect(connections.getConnectedChains('example.com')).toEqual([0]);
    });

    it('should return empty array for non-existing domain', () => {
      expect(connections.getConnectedChains('unknown.com')).toEqual([]);
    });

    it('should return multiple chains', () => {
      connections.add(mockConnection2);
      expect(connections.getConnectedChains('test.com')).toEqual([1, 2]);
    });
  });

  describe('getPermissions', () => {
    it('should return permissions for existing connection', () => {
      connections.add(mockConnection);
      const permissions = connections.getPermissions('example.com');
      expect(permissions).toEqual(mockConnection.permissions);
    });

    it('should return null for non-existing domain', () => {
      expect(connections.getPermissions('unknown.com')).toBeNull();
    });
  });

  describe('isAccountConnected', () => {
    beforeEach(() => {
      connections.add(mockConnection);
    });

    it('should return true for connected account', () => {
      expect(connections.isAccountConnected('example.com', 0)).toBe(true);
      expect(connections.isAccountConnected('example.com', 1)).toBe(true);
    });

    it('should return false for non-connected account', () => {
      expect(connections.isAccountConnected('example.com', 5)).toBe(false);
    });

    it('should return false for non-existing domain', () => {
      expect(connections.isAccountConnected('unknown.com', 0)).toBe(false);
    });
  });

  describe('isChainConnected', () => {
    beforeEach(() => {
      connections.add(mockConnection);
    });

    it('should return true for connected chain', () => {
      expect(connections.isChainConnected('example.com', 0)).toBe(true);
    });

    it('should return false for non-connected chain', () => {
      expect(connections.isChainConnected('example.com', 1)).toBe(false);
    });

    it('should return false for non-existing domain', () => {
      expect(connections.isChainConnected('unknown.com', 0)).toBe(false);
    });
  });

  describe('add', () => {
    it('should add new connection', () => {
      connections.add(mockConnection);
      expect(connections.list).toHaveLength(1);
      expect(connections.list[0]).toEqual(mockConnection);
    });

    it('should update existing connection with same origin', () => {
      connections.add(mockConnection);
      const updated = { ...mockConnection, title: 'Updated Title', domain: 'example.com' };
      connections.add(updated);
      
      expect(connections.list).toHaveLength(2);
    });

    it('should add multiple different connections', () => {
      connections.add(mockConnection);
      connections.add(mockConnection2);
      expect(connections.list).toHaveLength(2);
    });

    it('should preserve order when updating existing connection', () => {
      connections.add(mockConnection);
      connections.add(mockConnection2);
      
      const updated = { ...mockConnection, title: 'Updated', domain: 'example.com' };
      connections.add(updated);
      
      expect(connections.list[0].origin).toBe('https://example.com');
      expect(connections.list[0].title).toBe('Example Site');
      expect(connections.list[1].origin).toBe('https://test.com');
      expect(connections.list[2].title).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should remove existing connection by domain', () => {
      connections.add(mockConnection);
      connections.remove('example.com');
      expect(connections.list).toHaveLength(0);
    });

    it('should do nothing for non-existing domain', () => {
      connections.add(mockConnection);
      connections.remove('unknown.com');
      expect(connections.list).toHaveLength(1);
    });

    it('should only remove specified connection', () => {
      connections.add(mockConnection);
      connections.add(mockConnection2);
      connections.remove('example.com');
      
      expect(connections.list).toHaveLength(1);
      expect(connections.list[0].origin).toBe('https://test.com');
    });
  });

  describe('addAccount', () => {
    beforeEach(() => {
      connections.add({
        ...mockConnection,
        connectedAccounts: [...mockConnection.connectedAccounts]
      });
    });

    it('should add new account', () => {
      connections.addAccount('example.com', 5);
      expect(connections.getConnectedAccounts('example.com')).toContain(5);
    });

    it('should not duplicate existing account', () => {
      const accountsBefore = connections.getConnectedAccounts('example.com').length;
      connections.addAccount('example.com', 0);
      const accountsAfter = connections.getConnectedAccounts('example.com').length;
      expect(accountsAfter).toBe(accountsBefore);
    });

    it('should throw error for non-existing connection', () => {
      expect(() => connections.addAccount('unknown.com', 0)).toThrow();
    });
  });

  describe('removeAccount', () => {
    beforeEach(() => {
      connections.add({
        ...mockConnection,
        connectedAccounts: [...mockConnection.connectedAccounts]
      });
    });

    it('should remove existing account', () => {
      connections.removeAccount('example.com', 0);
      expect(connections.getConnectedAccounts('example.com')).not.toContain(0);
      expect(connections.getConnectedAccounts('example.com')).toContain(1);
    });

    it('should remove connection if no accounts remain', () => {
      connections.removeAccount('example.com', 0);
      connections.removeAccount('example.com', 1);
      expect(connections.find('example.com')).toBeUndefined();
    });

    it('should do nothing for non-existing connection', () => {
      const lengthBefore = connections.list.length;
      connections.removeAccount('unknown.com', 0);
      expect(connections.list.length).toBe(lengthBefore);
    });

    it('should do nothing for non-connected account', () => {
      const accountsBefore = [...connections.getConnectedAccounts('example.com')];
      connections.removeAccount('example.com', 99);
      const accountsAfter = connections.getConnectedAccounts('example.com');
      expect(accountsAfter).toEqual(accountsBefore);
    });
  });

  describe('addChain', () => {
    beforeEach(() => {
      connections.add({
        ...mockConnection,
        connectedChains: [...mockConnection.connectedChains]
      });
    });

    it('should add new chain', () => {
      connections.addChain('example.com', 5);
      expect(connections.getConnectedChains('example.com')).toContain(5);
    });

    it('should not duplicate existing chain', () => {
      const chainsBefore = connections.getConnectedChains('example.com').length;
      connections.addChain('example.com', 0);
      const chainsAfter = connections.getConnectedChains('example.com').length;
      expect(chainsAfter).toBe(chainsBefore);
    });

    it('should throw error for non-existing connection', () => {
      expect(() => connections.addChain('unknown.com', 0)).toThrow();
    });
  });

  describe('removeChain', () => {
    beforeEach(() => {
      connections.add({
        ...mockConnection,
        connectedChains: [...mockConnection.connectedChains]
      });
    });

    it('should remove existing chain', () => {
      connections.removeChain('example.com', 0);
      expect(connections.getConnectedChains('example.com')).not.toContain(0);
    });

    it('should not remove connection when chains remain', () => {
      connections.addChain('example.com', 1);
      connections.removeChain('example.com', 0);
      expect(connections.find('example.com')).toBeDefined();
      expect(connections.getConnectedChains('example.com')).toContain(1);
    });

    it('should do nothing for non-existing connection', () => {
      const lengthBefore = connections.list.length;
      connections.removeChain('unknown.com', 0);
      expect(connections.list.length).toBe(lengthBefore);
    });

    it('should do nothing for non-connected chain', () => {
      const chainsBefore = [...connections.getConnectedChains('example.com')];
      connections.removeChain('example.com', 99);
      const chainsAfter = connections.getConnectedChains('example.com');
      expect(chainsAfter).toEqual(chainsBefore);
    });
  });

  describe('updatePermissions', () => {
    beforeEach(() => {
      connections.add(mockConnection);
    });

    it('should update permissions', () => {
      connections.updatePermissions('example.com', { signTransactions: false });
      const permissions = connections.getPermissions('example.com');
      expect(permissions?.signTransactions).toBe(false);
      expect(permissions?.signMessages).toBe(true);
    });

    it('should merge permissions', () => {
      connections.updatePermissions('example.com', { 
        signTransactions: false,
        readChainData: false 
      });
      const permissions = connections.getPermissions('example.com');
      expect(permissions?.signTransactions).toBe(false);
      expect(permissions?.signMessages).toBe(true);
      expect(permissions?.readChainData).toBe(false);
    });

    it('should throw error for non-existing connection', () => {
      expect(() => connections.updatePermissions('unknown.com', {})).toThrow();
    });
  });

  describe('getAll', () => {
    it('should return empty array when no connections', () => {
      expect(connections.getAll()).toEqual([]);
    });

    it('should return all connections', () => {
      connections.add(mockConnection);
      connections.add(mockConnection2);
      const all = connections.getAll();
      expect(all).toHaveLength(2);
      expect(all).toEqual(connections.list);
    });
  });

  describe('removeByAccount', () => {
    beforeEach(() => {
      connections.add({
        ...mockConnection,
        connectedAccounts: [...mockConnection.connectedAccounts]
      });
      connections.add({
        ...mockConnection2,
        connectedAccounts: [...mockConnection2.connectedAccounts]
      });
    });

    it('should remove account from all connections', () => {
      connections.removeByAccount(0);
      expect(connections.getConnectedAccounts('example.com')).toEqual([0, 1]);
      expect(connections.getConnectedAccounts('example.com')).toContain(1);
    });

    it('should remove connection if only account is removed', () => {
      connections.removeByAccount(2);
      expect(connections.find('test.com')).toBeDefined();
    });

    it('should not affect connections without the account', () => {
      const accountsBefore = [...connections.getConnectedAccounts('example.com')];
      connections.removeByAccount(99);
      const accountsAfter = connections.getConnectedAccounts('example.com');
      expect(accountsAfter).toEqual(accountsBefore);
    });

    it('should handle removing from multiple connections', () => {
      connections.add({
        ...mockConnection,
        origin: 'https://multi.com',
        domain: 'multi.com',
        connectedAccounts: [0, 2, 3]
      });
      
      const testConnection = {
        ...mockConnection2,
        origin: 'https://test2.com',
        domain: 'test2.com', 
        connectedAccounts: [2]
      };
      connections.add(testConnection);
      
      connections.removeByAccount(2);
      
      expect(connections.find('test.com')).toBeDefined();
      expect(connections.find('test2.com')).toBeDefined();
      
      const multiAccounts = connections.getConnectedAccounts('multi.com');
      expect(multiAccounts).toContain(2);
    });
  });

  describe('removeByChain', () => {
    beforeEach(() => {
      connections.add(mockConnection);
      connections.add(mockConnection2);
    });

    it('should remove chain from all connections', () => {
      connections.removeByChain(1);
      expect(connections.getConnectedChains('test.com')).toEqual([1, 2]);
      expect(connections.getConnectedChains('test.com')).toContain(2);
    });

    it('should not remove connections when chains remain', () => {
      connections.removeByChain(1);
      const chains = connections.getConnectedChains('test.com');
      expect(chains).toEqual([1, 2]);
      expect(connections.find('test.com')).toBeDefined();
    });

    it('should not affect connections without the chain', () => {
      const chainsBefore = [...connections.getConnectedChains('example.com')];
      connections.removeByChain(99);
      const chainsAfter = connections.getConnectedChains('example.com');
      expect(chainsAfter).toEqual(chainsBefore);
    });
  });

  describe('getByAccount', () => {
    it('should return connections with specific account', () => {
      connections.add({
        ...mockConnection,
        connectedAccounts: [...mockConnection.connectedAccounts]
      });
      connections.add({
        ...mockConnection2,
        connectedAccounts: [...mockConnection2.connectedAccounts]
      });
      
      const result = connections.getByAccount(0);
      expect(result).toHaveLength(1);
      expect(result[0].origin).toBe('https://example.com');
    });

    it('should return empty array for non-connected account', () => {
      connections.add({
        ...mockConnection,
        connectedAccounts: [...mockConnection.connectedAccounts]
      });
      connections.add({
        ...mockConnection2,
        connectedAccounts: [...mockConnection2.connectedAccounts]
      });
      
      const result = connections.getByAccount(99);
      expect(result).toEqual([]);
    });

    it('should return multiple connections if account is shared', () => {
      connections.add({
        ...mockConnection,
        connectedAccounts: [...mockConnection.connectedAccounts]
      });
      connections.add({
        ...mockConnection2,
        connectedAccounts: [...mockConnection2.connectedAccounts]
      });
      
      const multiConnection = {
        ...mockConnection2,
        origin: 'https://multi.com',
        domain: 'multi.com',
        connectedAccounts: [0, 2]
      };
      connections.add(multiConnection);
      
      const result = connections.getByAccount(0);
      expect(result).toHaveLength(2);
    });
  });

  describe('getByChain', () => {
    beforeEach(() => {
      connections.add(mockConnection);
      connections.add(mockConnection2);
    });

    it('should return connections with specific chain', () => {
      const result = connections.getByChain(0);
      expect(result).toHaveLength(1);
      expect(result[0].origin).toBe('https://example.com');
    });

    it('should return empty array for non-connected chain', () => {
      const result = connections.getByChain(99);
      expect(result).toEqual([]);
    });

    it('should return multiple connections if chain is shared', () => {
      const multiConnection = {
        ...mockConnection,
        origin: 'https://multi.com',
        domain: 'multi.com',
        connectedChains: [0, 1]
      };
      connections.add(multiConnection);
      
      const result = connections.getByChain(0);
      expect(result).toHaveLength(2);
    });
  });

  describe('toJSON', () => {
    it('should serialize to IWeb3ConnectionsState', () => {
      connections.add(mockConnection);
      connections.add(mockConnection2);
      
      const json = connections.toJSON();
      expect(json).toHaveProperty('list');
      expect(json.list).toHaveLength(2);
      expect(json.list).toEqual(connections.list);
    });

    it('should return empty list when no connections', () => {
      const json = connections.toJSON();
      expect(json).toEqual({ list: [] });
    });

    it('should create serializable object', () => {
      connections.add(mockConnection);
      const json = connections.toJSON();
      
      expect(() => JSON.stringify(json)).not.toThrow();
      const parsed = JSON.parse(JSON.stringify(json));
      expect(parsed.list).toEqual(json.list);
    });
  });

  describe('edge cases and integration', () => {
    it('should handle rapid add/remove operations', () => {
      connections.add(mockConnection);
      connections.remove('example.com');
      connections.add(mockConnection);
      
      expect(connections.isConnected('example.com')).toBe(true);
    });

    it('should handle account operations on connection with no accounts', () => {
      const emptyConnection = { ...mockConnection, connectedAccounts: [] };
      connections.add(emptyConnection);
      
      connections.addAccount('example.com', 0);
      expect(connections.getConnectedAccounts('example.com')).toContain(0);
    });

    it('should handle chain operations on connection with no chains', () => {
      const emptyConnection = { ...mockConnection, connectedChains: [] };
      connections.add(emptyConnection);
      
      connections.addChain('example.com', 0);
      expect(connections.getConnectedChains('example.com')).toContain(0);
    });

    it('should maintain data integrity after multiple operations', () => {
      connections.add(mockConnection);
      connections.addAccount('example.com', 5);
      connections.addChain('example.com', 1);
      
      const connection = connections.list[0];
      expect(connection.connectedAccounts).toContain(5);
      expect(connection.connectedChains).toContain(1);
    });

    it('should handle connection without optional icon', () => {
      const noIconConnection = { ...mockConnection };
      delete noIconConnection.icon;
      
      connections.add(noIconConnection);
      expect(connections.list[0].icon).toBeUndefined();
    });

    it('should properly filter in getByAccount with overlapping accounts', () => {
      const conn1 = { ...mockConnection, connectedAccounts: [0, 1, 2] };
      const conn2 = { ...mockConnection2, connectedAccounts: [1, 3] };
      
      connections.add(conn1);
      connections.add(conn2);
      
      const result = connections.getByAccount(1);
      expect(result).toHaveLength(2);
    });
  });
});
