/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */

export enum ErrorMessages {
  WalletNotReady = 'Wallet is not sync.',
  WalletNotEnabled = 'Wallet is not enabled.',
  IncorrectKey = 'Incorrect Key.',
  InvalidEntropy = 'Invalid entropy.',
  WordListRequired = 'Word list is required.',
  RequestFailed = 'Something Wrong with node.',
  BadPrivateKey = 'Bad private key.',
  BadPubKey = 'Bad public key.',
  IsNotSecureRNG = 'No secure random number generator available.',
  Base16NotValid = 'is not a valid base 16 address.',
  CannotConvertBytes = 'Could not convert byte Buffer to 5-bit Buffer.',
  InvalidBech32 = 'Invalid bech32 address.',
  ExpectedHRP = 'Expected hrp to be zil.',
  BytesAandBIncorrect = 'Both a and b must be 16 bits or less.',
  PrivateKeyMustBe = 'Private key must be 32 bytes.',
  PublicKeyMustBe = 'Public key must be 33 or 65 bytes.',
  CouldNotDeriveHardened = 'Could not derive hardened child key',
  Scam = 'Scam detected.',
  MustBeUnique = 'Address must be unique.',
  MustBe = 'must be unique.',
  RequiredParam = 'is required.',
  OutOfIndex = 'Out of index.',
  IncorrectParams = 'Incorrect argument',
  SSnAllowNet = 'SSn list allow on mainnet only.',
  CannotExportLedger = 'Cannot export privateKey from ledger.'
}
