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

  const privKey = Buffer.from('2fcc9c48f0b778dcc7cbb8964ea1b95b5446b21d11159de2509d41e78e636cc7', 'hex');
  let keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 4096,
      publicExponent: new Uint8Array(privKey),
      hash: "SHA-512"
    },
    true,
    ["encrypt", "decrypt"]
  );
  const ciphertext = await encryptMessage(keyPair.publicKey);
  console.log(ciphertext);
  const decoded = await decryptMessage(keyPair.privateKey, ciphertext);
  console.log(decoded);
}());
