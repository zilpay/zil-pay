export * from './keys';
export * from './secure-message';

export interface SendResponseParams<T = unknown> {
  resolve?: T;
  reject?: unknown;
}
export type StreamResponse = (params: SendResponseParams) => void;
