import type { ChainConfig } from "background/storage";

export interface JsonRPCRequest {
  id: number;
  jsonrpc: string;
  method: string;
  params: unknown[];
}

export interface JsonRPCResponse<T> {
  id: number | string;
  jsonrpc: string;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export class RpcError extends Error {
  public code: number;
  public data?: unknown;

  constructor(message: string, code: number, data?: unknown) {
    super(message);
    this.name = 'RpcError';
    this.code = code;
    this.data = data;
  }
}

export class RpcProvider {
  public network: ChainConfig;

  constructor(network: ChainConfig) {
    this.network = network;
  }

  static buildPayload(method: string, params: unknown[]): JsonRPCRequest {
    return {
      id: 1,
      jsonrpc: '2.0',
      method,
      params,
    };
  }

  public async req<T>(payload: JsonRPCRequest | JsonRPCRequest[], jsonRPCError = true): Promise<T> {
    const client = {
      timeout: 5000,
    };

    let lastError: RpcError | null = null;
    const allNodes = this.network.rpc;

    if (allNodes.length === 0) {
      throw new RpcError('No RPC nodes', -32000);
    }

    const batchSize = 3;
    const currentBatch = allNodes.slice(0, batchSize);
    const failedNodesInBatch: string[] = [];

    for (const url of currentBatch) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), client.timeout);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          lastError = new RpcError(
            `Request failed with status ${response.status}`,
            response.status,
          );
          failedNodesInBatch.push(url);
          continue;
        }

        const text = await response.text();
        try {
          const json: JsonRPCResponse<T> | JsonRPCResponse<T>[] = JSON.parse(text);

          if (Array.isArray(json)) {
            if (jsonRPCError) {
              const errors = json
                .map((res) => res.error)
                .filter((err): err is NonNullable<typeof err> => !!err);
              if (errors.length > 0) {
                const firstError = errors[0];
                lastError = new RpcError(
                  firstError.message,
                  firstError.code,
                  firstError.data,
                );
                failedNodesInBatch.push(url);
                continue;
              }
            }
          } else if (json.error && jsonRPCError) {
            lastError = new RpcError(
              json.error.message,
              json.error.code,
              json.error.data,
            );
            failedNodesInBatch.push(url);
            continue;
          }

          return json as T;
        } catch (e: unknown) {
          if (e instanceof Error) {
            lastError = new RpcError(`Failed to parse JSON: ${e.message}`, -32700, text);
          } else {
            lastError = new RpcError('Failed to parse JSON: An unknown error occurred', -32700, text);
          }
          failedNodesInBatch.push(url);
          continue;
        }
      } catch (e: unknown) {
        if (e instanceof Error) {
            if (e.name === 'AbortError') {
              lastError = new RpcError(`Request timed out to ${url}`, -32603);
            } else {
              lastError = new RpcError(`Request to ${url} failed: ${e.message}`, -32603);
            }
        } else {
             lastError = new RpcError(`An unknown error occurred during the request to ${url}`, -32603);
        }
        failedNodesInBatch.push(url);
        continue;
      }
    }

    if (this.network.fallbackEnabled && failedNodesInBatch.length === currentBatch.length && currentBatch.length > 0) {
        const remainingNodes = allNodes.slice(currentBatch.length);
        this.network.rpc = [...remainingNodes, ...failedNodesInBatch];
    }
    
    throw lastError || new RpcError('Network is down or all nodes in batch failed', -32000);
  }
}

