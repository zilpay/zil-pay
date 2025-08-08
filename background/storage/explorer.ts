export interface IExplorerState {
  name: string;
  url: string;
  icon: string | null;
  standard: number;
} 

export class Explorer implements IExplorerState {
  name: string;
  url: string;
  icon: string | null;
  standard: number;

  constructor(data: IExplorerState) {
    this.name = data.name;
    this.url = data.url;
    this.icon = data.icon ?? null;
    this.standard = data.standard;
  }

  toJSON(): IExplorerState {
    return {
      name: this.name,
      url: this.url,
      icon: this.icon,
      standard: this.standard,
    };
  }
}
