import { utils } from "aes-js";

const SECRET_KEY_SIZE = 32;

export enum SecretKeyType {
  Secp256k1Sha256Zilliqa,
  Secp256k1Keccak256Ethereum,
}

export enum SecretKeyError {
  SecretKeySliceError = "Secret key slice error",
  InvalidHex = "Invalid hex string",
  InvalidLength = "Invalid key length",
  InvalidKeyType = "Invalid key type",
}

export class SecretKey {
  public type: SecretKeyType;
  public data: Uint8Array;

  constructor(type: SecretKeyType, data: Uint8Array) {
    this.type = type;
    this.data = data;

    if (data.length !== SECRET_KEY_SIZE) {
      throw new Error(SecretKeyError.InvalidLength);
    }
  }

  toBytes(): Uint8Array {
    const result = new Uint8Array(SECRET_KEY_SIZE + 1);
    result[0] = this.type === SecretKeyType.Secp256k1Sha256Zilliqa ? 0 : 1;
    result.set(this.data, 1);
    return result;
  }

  static fromBytes(bytes: Uint8Array): SecretKey {
    const keyType = bytes[0];
    const keyData = bytes.slice(1);

    if (keyData.length !== SECRET_KEY_SIZE) {
      throw new Error(SecretKeyError.SecretKeySliceError);
    }

    const keyDataArray = new Uint8Array(keyData);

    switch (keyType) {
      case 0:
        return new SecretKey(
          SecretKeyType.Secp256k1Sha256Zilliqa,
          keyDataArray,
        );
      case 1:
        return new SecretKey(
          SecretKeyType.Secp256k1Keccak256Ethereum,
          keyDataArray,
        );
      default:
        throw new Error(SecretKeyError.InvalidKeyType);
    }
  }

  toHexString(): string {
    return utils.hex.fromBytes(this.toBytes());
  }

  static fromString(s: string): SecretKey {
    try {
      const data = utils.hex.toBytes(s);

      if (!data || data.length === 0) {
        throw new Error(SecretKeyError.InvalidHex);
      }

      const prefix = data[0];
      const keyData = data.slice(1);

      if (keyData.length !== SECRET_KEY_SIZE) {
        throw new Error(SecretKeyError.InvalidLength);
      }

      const keyDataArray = new Uint8Array(keyData);

      let type: SecretKeyType;
      switch (prefix) {
        case 0:
          type = SecretKeyType.Secp256k1Sha256Zilliqa;
          break;
        case 1:
          type = SecretKeyType.Secp256k1Keccak256Ethereum;
          break;
        default:
          throw new Error(SecretKeyError.InvalidKeyType);
      }

      return new SecretKey(type, keyDataArray);
    } catch (error) {
      throw new Error(SecretKeyError.InvalidHex);
    }
  }
}
