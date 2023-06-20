export interface InputCipherParams {
  content: string;
  uuid: string;
  title: string;
  icon: string;
  domain: string;
};

export interface CipherState {
  encryptParams?: InputCipherParams;
  decryptParams?: InputCipherParams;
}
