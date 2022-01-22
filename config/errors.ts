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
  IncorrectPassword = 'Incorect password',
  WalletNotEnabled = 'Wallet is not enabled.',
  IncorrectType = 'Incorect params type',
  IncorrectFormat = 'Incorect address format',
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
  InvalidMnemonicChecksum = 'Invalid mnemonic checksum',
  BytesAandBIncorrect = 'Both a and b must be 16 bits or less.',
  PrivateKeyMustBe = 'Private key must be 32 bytes.',
  PublicKeyMustBe = 'Public key must be 33 or 65 bytes.',
  CouldNotDeriveHardened = 'Could not derive hardened child key',
  Scam = 'Scam detected.',
  IncorrectMnemonic = 'Invalid mnemonic.',
  ShouldBeNumber = 'should be number',
  MustBeUnique = 'Address must be unique.',
  MustBe = 'must be unique.',
  MustBeObject = 'Must be object.',
  MustBeString = 'Must be string.',
  RequiredParam = 'is required.',
  OutOfIndex = 'Out of index.',
  IncorrectParams = 'Incorrect argument',
  SSnAllowNet = 'SSn list allow on mainnet only.',
  CannotExportLedger = 'Cannot export privateKey from ledger.',
  HightNonce = 'nonce too High',

  Disabled = 'ZilPay is disabled.',
  Connect = 'User is\'t connections.',
  Rejected = 'Rejected by user',

  WebHidNotSupported = 'WEBHID is not supported.',
  NoFoundDeviced = 'No one device connected',

  CannotBeZero = 'A param cannot be zero.',
  TimeOut = 'request failed by timeout!'
}
