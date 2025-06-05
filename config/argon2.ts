import { utils } from "aes-js";

export const WALLET_SALT = utils.utf8.toBytes(
  "ZILPAY:54040c2f-1ec1-4eb1-9595-6e4294d14fd6",
);
export const APP_ID = utils.utf8.toBytes("ZilPay-wallet-app");
