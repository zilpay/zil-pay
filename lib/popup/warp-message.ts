export type Params = object[] | string[] | number[] | (string | string[] | number[])[];

export interface SendResponseParams {
  resolve?: unknown;
  reject?: unknown;
}
export type StreamResponse = (params: SendResponseParams) => void;

export interface ProxyContentType {
  params: Params;
  method: string;
  uuid: string;
}

export function warpMessage<T>(msg: SendResponseParams): T | undefined {
  if (!msg) {
    return;
  }

  if (msg.reject) {
    throw new Error(String(msg.reject));
  }

  return msg.resolve as T;
}
