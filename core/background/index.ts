import { ZIlPayBackground } from 'core/background/wallet/bg-zilpay';
import { startBackground } from './background';
import { Buffer } from 'buffer';


async function encryptMessage(publicKey) {
  let enc = new TextEncoder();
  let encoded = enc.encode('message');
  return await window.crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    publicKey,
    encoded
  );
}

async function decryptMessage(key, ciphertext) {
  let decrypted = await window.crypto.subtle.decrypt(
    {
      name: "RSA-OAEP"
    },
    key,
    ciphertext
  );

  let dec = new TextDecoder();
  return dec.decode(decrypted);
}


(async function() {
  const core = new ZIlPayBackground();

  await core.sync();

  startBackground(core);
}());
