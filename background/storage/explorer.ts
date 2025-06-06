export class Explorer {
  name: string;
  url: string;
  icon: string | null;
  standard: number;

  constructor(data: Record<string, unknown>) {
    this.name = data.name as string;
    this.url = data.url as string;
    this.icon = data.icon as string | null ?? null;
    this.standard = data.standard as number;
  }
}
