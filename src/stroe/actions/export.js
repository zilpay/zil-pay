import { MTypesAuth } from '../../lib/messages/messageTypes'
import { Message } from '../../lib/messages/messageCall'


export async function exportSeed(_, password) {
  const result = await new Message({
    type: MTypesAuth.EXPORT_SEED,
    payload: { password }
  }).send();

  if (result.resolve) {
    return result.resolve;
  } else if (result.reject) {
    throw new Error(result.reject);
  }

  return null;
}

export async function exportPrivKey(_, password) {
  const result = await new Message({
    type: MTypesAuth.EXPORT_PRIV_KEY,
    payload: { password }
  }).send();

  if (result.resolve) {
    return result.resolve;
  } else if (result.reject) {
    throw new Error(result.reject);
  }

  return null;
}