import { sign, verify } from 'jsonwebtoken'
import jwtConfig from '../config/jwt'
import Crypto from './crypto'
import Storage from './storage'


export default class extends Crypto {

  _salt = jwtConfig.salt;
  _EXT_ID = Storage.EXT_ID;
  _params = {
    expiresIn: jwtConfig.time
  };

  generateKey(key) {
    return this.hash(key + this._salt);
  }

  createPHash(key) {
    return this.hash(key + this._EXT_ID);
  }

  tokenCreate(key) {
    let phash = this.createPHash(key);
    let payload = { phash };

    return new Promise((resolve, reject) => {
      sign(payload, key, this._params, (err, token) => {
        if (err) return reject(err);
        return resolve({
          token, phash
        });
      });
    });
  }

  tokenVerify(token, key) {
    return new Promise((resolve, reject) => {
      verify(token, key, this._params, (err, decoded) => {
        if (err) return reject(err);
        return resolve(decoded);
      });
    });
  }
}
