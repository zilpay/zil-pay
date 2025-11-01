import type { ChainConfig } from "background/storage";

export interface JsonRPCRequest<T = unknown[]> {
  id: number;
  jsonrpc: string;
  method: string;
  params: T;
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

const DEFAULT_TIMEOUT = 5000;
const DEFAULT_BATCH_SIZE = 3;

async function fetchWithTimeout(
  url: string,
  body: string,
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

function parseJsonResponse<T>(text: string): JsonRPCResponse<T> | JsonRPCResponse<T>[] {
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new RpcError(String(e), -32700, text);
  }
}

function validateJsonRpcResponse<T>(
  json: JsonRPCResponse<T> | JsonRPCResponse<T>[],
  jsonRPCError: boolean,
  ignore: number[]
): void {
  if (Array.isArray(json)) {
    if (jsonRPCError) {
      const errors = json
        .map((res) => res.error)
        .filter((err): err is NonNullable<typeof err> => 
          !!err && !ignore.includes(err.code)
        );
      
      if (errors.length > 0) {
        const firstError = errors[0];
        throw new RpcError(firstError.message, firstError.code, firstError.data);
      }
    }
  } else if (json.error && jsonRPCError && !ignore.includes(json.error.code)) {
    throw new RpcError(json.error.message, json.error.code, json.error.data);
  }
}

async function makeRequest<T>(
  url: string,
  payload: JsonRPCRequest | JsonRPCRequest[],
  timeout: number,
  jsonRPCError: boolean,
  ignore: number[]
): Promise<T> {
  const response = await fetchWithTimeout(url, JSON.stringify(payload), timeout);

  if (!response.ok) {
    throw new RpcError(`Request failed with status ${response.status}`, response.status);
  }

  const text = await response.text();
  const json = parseJsonResponse<T>(text);
  
  validateJsonRpcResponse(json, jsonRPCError, ignore);
  
  return json as T;
}

async function tryNodeBatch<T>(
  nodes: string[],
  payload: JsonRPCRequest | JsonRPCRequest[],
  timeout: number,
  jsonRPCError: boolean,
  ignore: number[]
): Promise<{ result?: T; errors: RpcError[]; failedNodes: string[] }> {
  const errors: RpcError[] = [];
  const failedNodes: string[] = [];

  for (const url of nodes) {
    try {
      const result = await makeRequest<T>(url, payload, timeout, jsonRPCError, ignore);
      return { result, errors, failedNodes };
    } catch (error) {
      const rpcError = error instanceof RpcError 
        ? error 
        : error instanceof Error && error.name === 'AbortError'
          ? new RpcError(`Timed out to ${url}`, -32603)
          : new RpcError(`Request to ${url} failed: ${String(error)}`, -32603);
      
      errors.push(rpcError);
      failedNodes.push(url);
    }
  }

  return { errors, failedNodes };
}

async function executeSequentialRequests<T>(
  url: string,
  requests: JsonRPCRequest[],
  timeout: number,
  jsonRPCError: boolean,
  ignore: number[]
): Promise<JsonRPCResponse<T>[]> {
  const results: JsonRPCResponse<T>[] = [];

  for (const request of requests) {
    try {
      const response = await makeRequest<JsonRPCResponse<T>>(
        url,
        request,
        timeout,
        false,
        ignore
      );
      results.push(response);
    } catch (error) {
      if (error instanceof RpcError && jsonRPCError && !ignore.includes(error.code)) {
        throw error;
      }
      results.push({
        id: request.id,
        jsonrpc: request.jsonrpc,
        error: error instanceof RpcError 
          ? { code: error.code, message: error.message, data: error.data }
          : { code: -32603, message: String(error) }
      });
    }
  }

  return results;
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

  public async req<T>(
    payload: JsonRPCRequest | JsonRPCRequest[],
    jsonRPCError = true,
    ignore: number[] = []
  ): Promise<T> {
    const allNodes = this.network.rpc;

    if (allNodes.length === 0) {
      throw new RpcError('No RPC nodes', -32000);
    }

    const isBatchRequest = Array.isArray(payload);
    const batchEnabled = this.network.batchRequest !== false;

    if (isBatchRequest && !batchEnabled) {
      return this.#executeSequential<T>(payload, jsonRPCError, ignore);
    }

    return this.#executeBatch<T>(payload, jsonRPCError, ignore);
  }

  async #executeSequential<T>(
    requests: JsonRPCRequest[],
    jsonRPCError: boolean,
    ignore: number[]
  ): Promise<T> {
    const allNodes = this.network.rpc;
    const currentBatch = allNodes.slice(0, DEFAULT_BATCH_SIZE);
    let lastErrors: RpcError[] = [];
    let failedNodesInBatch: string[] = [];

    for (const url of currentBatch) {
      try {
        const results = await executeSequentialRequests<any>(
          url,
          requests,
          DEFAULT_TIMEOUT,
          jsonRPCError,
          ignore
        );
        return results as T;
      } catch (error) {
        const rpcError = error instanceof RpcError 
          ? error 
          : new RpcError(String(error), -32603);
        lastErrors.push(rpcError);
        failedNodesInBatch.push(url);
      }
    }

    this.#handleFallback(currentBatch, failedNodesInBatch);
    this.#throwAggregatedError(lastErrors);
  }

  async #executeBatch<T>(
    payload: JsonRPCRequest | JsonRPCRequest[],
    jsonRPCError: boolean,
    ignore: number[]
  ): Promise<T> {
    const allNodes = this.network.rpc;
    const currentBatch = allNodes.slice(0, DEFAULT_BATCH_SIZE);

    const { result, errors, failedNodes } = await tryNodeBatch<T>(
      currentBatch,
      payload,
      DEFAULT_TIMEOUT,
      jsonRPCError,
      ignore
    );

    if (result !== undefined) {
      return result;
    }

    this.#handleFallback(currentBatch, failedNodes);
    this.#throwAggregatedError(errors);
  }

  #handleFallback(currentBatch: string[], failedNodes: string[]): void {
    if (
      this.network.fallbackEnabled &&
      failedNodes.length === currentBatch.length &&
      currentBatch.length > 0
    ) {
      const allNodes = this.network.rpc;
      const remainingNodes = allNodes.slice(currentBatch.length);
      this.network.rpc = [...remainingNodes, ...failedNodes];
    }
  }

  #throwAggregatedError(errors: RpcError[]): never {
    if (errors.length > 0) {
      const message = errors.map(e => e.message).join(", ");
      throw new RpcError(message, -32000);
    }
    throw new RpcError('Network is down', -32000);
  }
}
