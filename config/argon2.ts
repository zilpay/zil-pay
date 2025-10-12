import { utf8ToUint8Array } from "lib/utils/utf8";

export const WALLET_SALT = utf8ToUint8Array(
  "ZILPAY:54040c2f-1ec1-4eb1-9595-6e4294d14fd6",
);
export const APP_ID = utf8ToUint8Array("ZilPay-wallet-app");

export enum HashTypes {
  Argon2,
  Pbkdf2,
}

