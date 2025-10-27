export interface ConnectParams {
  colors: {
    primary: string;
    background: string;
    text: string;
  };
  description: string;
  domain: string;
  icon: string;
  payload: Record<string, unknown>;
  title: string;
  type: string;
  uuid: string;
}
