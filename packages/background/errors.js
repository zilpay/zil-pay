/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import {
  CONNECT,
  DISABLED,
  USER_REJECTED,
  MUST_BE_STRING,
  DISABLE_DMETHOD,
  MUST_BE_OBJECT,
  TYPE_ERR,
  MUST_BE_INT,
  UNIQUE,
  UNAUTHORIZED,
  FORBIDDEN_TO_USE,
  BAD_CONTRACT_ADDRESS
} from 'lib/errors/annotations'

export const ERROR_MSGS = {
  CONNECT,
  DISABLED,
  USER_REJECTED,
  MUST_BE_STRING,
  MUST_BE_OBJECT,
  DISABLE_DMETHOD,
  MUST_BE_INT,
  TYPE_ERR,
  UNIQUE,
  UNAUTHORIZED,
  FORBIDDEN_TO_USE,
  BAD_CONTRACT_ADDRESS
}

export * from 'lib/errors'
