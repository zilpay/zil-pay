import { lib } from 'crypto-js';
import aes from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';
import Hex from 'crypto-js/enc-hex';
import Base64 from 'crypto-js/enc-base64';


export class CipherControl {
  encrypt(publickey: string, message: string) {
    const iv = lib.WordArray.random(128 / 8);
    const encryptData = aes.encrypt(
      message,
      publickey,
      { iv: iv }
    );

    return {
      iv: encryptData.iv.toString(Hex),
      cipher: encryptData.ciphertext.toString(Base64)
    };
  }

  decrypt(privateKey: string, cipher: string, iv: string) {
    const decrypted = aes.decrypt(
      cipher,
      Hex.parse(privateKey),
      { iv: Hex.parse(iv) }
    );

    return decrypted.toString(Utf8);
  }
}
