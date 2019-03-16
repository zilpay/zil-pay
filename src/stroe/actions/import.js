import { MTypesAuth } from '../../lib/messages/messageTypes'
import { Message } from '../../lib/messages/messageCall'


export async function importByPrivateKey({ state }, privKey) {
  const result = await new Message({
    type: MTypesAuth.IMPORT_PRIV_KEY,
    payload: { privKey }
  }).send();

  if (result.resolve) {
    state.wallet = result.resolve;
    return result.resolve;
  } else if (result.reject) {
    throw new Error(result.reject);
  }

  return null;
}