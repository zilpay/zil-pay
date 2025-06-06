export class Contact {
  name: string;
  address: string;
  notes?: string;
  createdAt: string;

  constructor(data: Record<string, unknown>) {
    this.name = data.name as string;
    this.address = data.address as string;
    this.notes = data.notes as string | undefined;
    this.createdAt = (data.createdAt as string) ?? new Date().toISOString();
  }
}

