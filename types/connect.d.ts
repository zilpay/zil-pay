export interface ConnectParams<T = unknown> {
  colors: {
    primary: string;
    background: string;
    text: string;
  };
  payload?: T;
  description: string;
  domain: string;
  icon: string;
  title: string;
  type: string;
  uuid: string;
}
