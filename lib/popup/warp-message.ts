import type { SendResponseParams } from 'types/stream';

export function warpMessage<T>(msg: SendResponseParams): T | undefined {
  if (!msg) {
    return;
  }

  if (msg.reject) {
    throw new Error(String(msg.reject));
  }

  return msg.resolve;
}
