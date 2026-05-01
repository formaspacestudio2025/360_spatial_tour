import db, { db as jsonDb, save as jsonSave } from './database';

/**
 * Database Adapter Interface
 * Provides a consistent API for different database backends
 */
export interface DatabaseAdapter {
  read(): any;
  write(data: any): void;
  query(table: string): any[];
  findById(table: string, id: string): any;
  insert(table: string, record: any): any;
  update(table: string, id: string, data: any): any;
  delete(table: string, id: string): boolean;
}

/**
 * JSON Database Adapter - wraps existing JSON file implementation
 */
export class JsonAdapter implements DatabaseAdapter {
  private db: any;
  private saveFn: () => void;

  constructor(dbInstance: any = jsonDb, saveFn: () => void = jsonSave) {
    this.db = dbInstance;
    this.saveFn = saveFn;
  }

  read(): any {
    return this.db;
  }

  write(data: any): void {
    Object.assign(this.db, data);
    this.saveFn();
  }

  query(table: string): any[] {
    return this.db[table] || [];
  }

  findById(table: string, id: string): any {
    const tableData = this.db[table] || [];
    return tableData.find((record: any) => record.id === id) || null;
  }

  insert(table: string, record: any): any {
    if (!this.db[table]) {
      this.db[table] = [];
    }
    this.db[table].push(record);
    this.saveFn();
    return record;
  }

  update(table: string, id: string, data: any): any {
    if (!this.db[table]) return null;
    const index = this.db[table].findIndex((r: any) => r.id === id);
    if (index === -1) return null;
    this.db[table][index] = { ...this.db[table][index], ...data };
    this.saveFn();
    return this.db[table][index];
  }

  delete(table: string, id: string): boolean {
    if (!this.db[table]) return false;
    const index = this.db[table].findIndex((r: any) => r.id === id);
    if (index === -1) return false;
    this.db[table].splice(index, 1);
    this.saveFn();
    return true;
  }
}

// Export a default adapter instance
export const defaultAdapter = new JsonAdapter();

/**
 * Get adapter based on environment configuration
 */
export function getDatabaseAdapter(): DatabaseAdapter {
  const driver = process.env.DB_DRIVER || 'json';
  switch (driver) {
    case 'json':
      return new JsonAdapter();
    case 'sqlite':
      // Will be implemented in 12.2
      throw new Error('SQLite adapter not yet implemented');
    default:
      return new JsonAdapter();
  }
}
