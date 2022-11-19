import { ZIlPayBackground } from 'core/background/wallet/bg-zilpay';
import { startBackground } from './background';


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

  let keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256"
    },
    true,
    ["encrypt", "decrypt"]
  );
  const ciphertext = await encryptMessage(keyPair.publicKey);
  console.log(ciphertext);
  const decoded = await decryptMessage(keyPair.privateKey, ciphertext);
  console.log(decoded);
}());
