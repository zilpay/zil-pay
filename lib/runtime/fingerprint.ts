import { utils } from 'aes-js';
import { EXTENSION_ID, Runtime } from './';

export async function generateSalt(): Promise<Uint8Array> {
  const dynamicId = await Runtime.runtime.getPlatformInfo();
  const salt = `${EXTENSION_ID}:${dynamicId.arch}:${dynamicId.nacl_arch}:${dynamicId.os}`;

  return utils.utf8.toBytes(salt);
}
