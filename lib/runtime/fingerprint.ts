import { utils } from 'aes-js';
import { EXTENSION_ID, Runtime } from './';

export async function generateSalt(): Promise<Uint8Array> {
  let salt = EXTENSION_ID;

  try {
    const dynamicId = await Runtime.runtime.getPlatformInfo();
    salt += `${dynamicId.arch}:${dynamicId.nacl_arch}:${dynamicId.os}`;
  } catch {
    //
  }

  return utils.utf8.toBytes(salt);
}
