export class Explorer {
  name: string;
  url: string;
  icon: string | null;
  standard: number;

  constructor(data: {
    name: string;
    url: string;
    icon?: string | null;
    standard: number;
  }) {
    this.name = data.name;
    this.url = data.url;
    this.icon = data.icon ?? null;
    this.standard = data.standard;
  }
}
