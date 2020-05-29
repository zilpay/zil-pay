/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
export default {
  RequiredVar: (varName) => new Error(`${varName} is required`),
  InitParams: new Error('Cannot deploy without code or initialisation parameters.'),
  ShouldArray: new Error('should be array'),
  VariableNameRequired: new Error('Variable name required'),
  IncorectAddress: new Error('Incorrect address format'),
  HTTPProviderInstance: new Error('should be HTTPProvider instance.'),
  WalletInstance: new Error('should be Wallet instance.'),
  TransactionFactoryInstance: new Error('should be TransactionFactory instance.'),
  TransactionInstance: new Error('should be Transaction instance.'),
  Connect: new Error('User is\'t connections.'),
  DisabledMethod: new Error('This method not allowed in ZIlPay'),
  Disabled: new Error('ZilPay is disabled.'),
  ContractHasntDeployed: new Error('Contract has not been deployed!'),
  Args: new Error('Set arguments as zilPay.wallet.observableTransaction(hash, hash, hash)')
}
