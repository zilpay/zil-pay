export class StorageMeta {
  dataSchemaVersion: string;
  securitySchemaVersion: string;
  lastMigrationTimestamp?: string;
  createdAt: string;
  lastUnlockedTimestamp?: string;

  constructor(data: Record<string, unknown>) {
    this.dataSchemaVersion = (data.dataSchemaVersion as string) ?? "4.0.0";
    this.securitySchemaVersion = (data.securitySchemaVersion as string) ?? "2.0.0";
    this.createdAt = (data.createdAt as string) ?? new Date().toISOString();
    this.lastMigrationTimestamp = data.lastMigrationTimestamp as string | undefined;
    this.lastUnlockedTimestamp = data.lastUnlockedTimestamp as string | undefined;
  }

  toJSON(): Record<string, unknown> {
    return {
      dataSchemaVersion: this.dataSchemaVersion,
      securitySchemaVersion: this.securitySchemaVersion,
      lastMigrationTimestamp: this.lastMigrationTimestamp,
      createdAt: this.createdAt,
      lastUnlockedTimestamp: this.lastUnlockedTimestamp,
    };
  }
}
