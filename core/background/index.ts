import { ZIlPayBackground } from 'core/background/wallet/bg-zilpay';
import { startBackground } from './background';
import { Buffer } from 'buffer';
import EC from 'elliptic/lib/elliptic/ec';


(async function() {
  const core = new ZIlPayBackground();

  await core.sync();

  startBackground(core);

  const secp256k1 = new EC('secp256k1');
  const privateKey = Buffer.from('', 'hex');
  const keyPair = secp256k1.keyFromPrivate(privateKey.toString('hex'));
  const prvPoint = keyPair.getPrivate();
  const key_encoded = await crypto.subtle.importKey(
    "raw",
    prvPoint.toBuffer(),
    "AES-CTR",
    false,
    ["encrypt", "decrypt"]
  );
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const message = 'message test';
  const enc = new TextEncoder();
  const data = enc.encode(message);
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: "AES-CTR",
      counter: iv,
      length: 128
    },
    key_encoded,
    data
  );
  console.log(`${Buffer.from(ciphertext).toString('hex')}:${Buffer.from(iv).toString('hex')}`);
  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-CTR",
      counter: iv,
      length: 128
    },
    key_encoded,
    ciphertext
  );
  console.log(Buffer.from(decrypted).toString('utf8'));
}());
