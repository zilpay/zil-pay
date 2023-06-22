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

export interface SetPasswordPayload {
  password: string;
  current: string;
  algorithm: string;
  iteractions: number;
}
