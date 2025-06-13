import { Signature } from '@noble/secp256k1';
import { ProjectivePoint } from '@noble/secp256k1';
import { CURVE } from '@noble/secp256k1';
import { randomBytes } from '../random';
import { sha256 } from '../sha256';
import { uint8ArrayToBigIntBigEndian } from '../number';
import { fromZILPrivateKey } from './pubkey';

const MAX_TRY_SIGN = 100_000_000;

export async function sign(message: Uint8Array, secretKey: Uint8Array): Promise<Signature> {
  let safeCounter = 0;

  while (safeCounter < MAX_TRY_SIGN) {
    const kBytes = randomBytes(32);
    const k = uint8ArrayToBigIntBigEndian(kBytes) % CURVE.n;

    const signature = await signInner(k, message, secretKey);
    if (signature) {
      return signature;
    }

    safeCounter++;
  }

  throw new Error('InvalidSignTry: Exceeded maximum signing attempts');
}

export async function signInner(k: bigint, message: Uint8Array, secretKey: Uint8Array): Promise<Signature | null> {
  const publicKey = fromZILPrivateKey(secretKey);

  const QPoint = ProjectivePoint.BASE.multiply(k);
  const Q = QPoint.toRawBytes(true);

  const hasherInput = new Uint8Array([...Q, ...publicKey, ...message]);
  const hash = await sha256(hasherInput);
  const r = uint8ArrayToBigIntBigEndian(hash) % CURVE.n;

  if (r === 0n) {
    return null;
  }

  const secretKeyScalar = uint8ArrayToBigIntBigEndian(secretKey);
  const rTimesSecret = (r * secretKeyScalar) % CURVE.n;
  const s = (k - rTimesSecret + CURVE.n) % CURVE.n;

  if (s === 0n) {
    return null;
  }

  return new Signature(r, s);
}

export async function verify(
  message: Uint8Array,
  publicKey: Uint8Array,
  signature: Signature
): Promise<boolean> {
  const r = signature.r;
  const s = signature.s;

  const sG = ProjectivePoint.BASE.multiply(s);
  const publicKeyPoint = ProjectivePoint.fromHex(Uint8Array.from(publicKey));
  const rPub = publicKeyPoint.multiply(r);
  const QPoint = sG.add(rPub);
  const Q = QPoint.toRawBytes(true);

  if (QPoint.equals(ProjectivePoint.ZERO)) {
    return false;
  }

  const hasherInput = new Uint8Array([...Q, ...publicKey, ...message]);
  const hash = await sha256(hasherInput);
  const rDash = uint8ArrayToBigIntBigEndian(hash) % CURVE.n;

  return rDash === r;
}

