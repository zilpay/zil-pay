import * as secp256k1 from 'noble-secp256k1';
import { randomBytes } from '../random';
import { sha256 } from '../sha256';
import { uint8ArrayToBigIntBigEndian, uint8ArrayToBigIntLittleEndian } from '../number';
import { fromZILPrivateKey } from './pubkey';

const MAX_TRY_SIGN = 100_000_000;

// Custom error class for Schnorr-related errors
class SchnorrError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SchnorrError';
  }
}

// Sign a message using a secret key, following the Schnorr-like signature scheme
async function sign(message: Uint8Array, secretKey: Uint8Array): Promise<secp256k1.Signature> {
  let safeCounter = 0;

  while (safeCounter < MAX_TRY_SIGN) {
    // Generate random k (nonce) as a 32-byte array
    const kBytes = randomBytes(32);
    // Convert to scalar (bigint) modulo curve order n
    const k = uint8ArrayToBigIntBigEndian(kBytes) % secp256k1.CURVE.n;

    const signature = await signInner(k, message, secretKey);
    if (signature) {
      return signature;
    }

    safeCounter++;
  }

  throw new SchnorrError('InvalidSignTry: Exceeded maximum signing attempts');
}

// Inner signing function that attempts to create a signature with a given k
async function signInner(k: bigint, message: Uint8Array, secretKey: Uint8Array): Promise<secp256k1.Signature | null> {
  // Compute public key from secret key (compressed, 33 bytes)
  const publicKey = fromZILPrivateKey(secretKey);

  // Compute commitment Q = k * G (where G is the generator point)
  const QPoint = secp256k1.Point.BASE.multiply(k);
  const Q = QPoint.toRawBytes(true); // Compressed Q

  // Compute challenge r = H(Q || publicKey || message) mod n
  const hasherInput = new Uint8Array([...Q, ...publicKey, ...message]);
  const hash = await sha256(hasherInput);
  const r = uint8ArrayToBigIntBigEndian(hash) % secp256k1.CURVE.n;

  // If r = 0 mod n, signature is invalid, return null
  if (r === 0n) {
    return null;
  }

  // Compute s = k - r * secretKey mod n
  const secretKeyScalar = uint8ArrayToBigIntLittleEndian(secretKey);
  const rTimesSecret = (r * secretKeyScalar) % secp256k1.CURVE.n;
  const s = (k - rTimesSecret + secp256k1.CURVE.n) % secp256k1.CURVE.n;

  // If s = 0 mod n, signature is invalid, return null
  if (s === 0n) {
    return null;
  }

  // Return signature (r, s)
  return new secp256k1.Signature(r, s);
}

// Verify a signature for a message using a public key
async function verify(
  message: Uint8Array,
  publicKey: Uint8Array,
  signature: secp256k1.Signature
): Promise<boolean> {
  try {
    secp256k1.Point.fromHex(publicKey); // Validate public key
  } catch {
    return false; // Invalid public key
  }

  const r = signature.r;
  const s = signature.s;

  // Compute Q = s * G + r * publicKey
  const sG = secp256k1.Point.BASE.multiply(s); // s * G
  const publicKeyPoint = secp256k1.Point.fromHex(publicKey);
  const rPub = publicKeyPoint.multiply(r); // r * publicKey
  const QPoint = sG.add(rPub);
  const Q = QPoint.toRawBytes(true); // Compressed Q

  // If Q is the point at infinity, verification fails
  if (QPoint.equals(secp256k1.Point.ZERO)) {
    return false;
  }

  // Compute r' = H(Q || publicKey || message) mod n
  const hasherInput = new Uint8Array([...Q, ...publicKey, ...message]);
  const hash = await sha256(hasherInput);
  const rDash = uint8ArrayToBigIntLittleEndian(hash) % secp256k1.CURVE.n;

  // Verification succeeds if r' == r
  return rDash === r;
}

export const Schnorr = Object.freeze({
  sign,
  verify,
  SchnorrError,
});

