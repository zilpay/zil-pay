export * from './keys';
export * from './secure-message';

export interface SendResponseParams {
  resolve?: unknown;
  reject?: unknown;
}
export type StreamResponse = (params: SendResponseParams) => void;
