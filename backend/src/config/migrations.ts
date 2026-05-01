import fs from 'fs';
import path from 'path';
import { getDatabaseAdapter } from './database.adapter';

interface Migration {
  version: number;
  name: string;
  up: (adapter: any) => void;
  down?: (adapter: any) => void;
}

class MigrationManager {
  private migrations: Migration[] = [];
  private adapter: any;

  constructor() {
    this.adapter = getDatabaseAdapter();
  }

  /**
   * Load migration files from the migrations directory
   */
  loadMigrations(): void {
    const migrationsDir = path.join(__dirname, '../migrations');

    if (!fs.existsSync(migrationsDir)) {
      console.log('No migrations directory found, creating...');
      fs.mkdirSync(migrationsDir, { recursive: true });
      return;
    }

    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.ts') || f.endsWith('.js'))
      .sort();

    for (const file of files) {
      try {
        const migrationPath = path.join(migrationsDir, file);
        // Dynamically require the migration file
        const migration = require(migrationPath);
        if (migration.version && migration.up) {
          this.migrations.push({
            version: migration.version,
            name: migration.name || file,
            up: migration.up,
            down: migration.down,
          });
        }
      } catch (e: any) {
        console.error(`Failed to load migration ${file}:`, e.message);
      }
    }

    // Sort by version
    this.migrations.sort((a, b) => a.version - b.version);
  }

  /**
   * Get applied migrations from the database
   */
  private getAppliedMigrations(): number[] {
    try {
      const db = this.adapter.read();
      const migrationsTable = db.migrations || [];
      return migrationsTable.map((m: any) => m.version);
    } catch (e) {
      return [];
    }
  }

  /**
   * Mark a migration as applied
   */
  private markAsApplied(migration: Migration): void {
    try {
      const db = this.adapter.read();
      if (!db.migrations) {
        db.migrations = [];
      }
      db.migrations.push({
        version: migration.version,
        name: migration.name,
        applied_at: new Date().toISOString(),
      });
      this.adapter.write(db);
    } catch (e: any) {
      console.error('Failed to mark migration as applied:', e.message);
    }
  }

  /**
   * Run all pending migrations
   */
  async runMigrations(): Promise<{ applied: number; skipped: number }> {
    this.loadMigrations();

    if (this.migrations.length === 0) {
      console.log('No migrations to run');
      return { applied: 0, skipped: 0 };
    }

    const appliedVersions = this.getAppliedMigrations();
    let applied = 0;
    let skipped = 0;

    for (const migration of this.migrations) {
      if (appliedVersions.includes(migration.version)) {
        skipped++;
        continue;
      }

      try {
        console.log(`Running migration ${migration.version}: ${migration.name}...`);
        await migration.up(this.adapter);
        this.markAsApplied(migration);
        applied++;
        console.log(`✅ Migration ${migration.version} completed`);
      } catch (e: any) {
        console.error(`❌ Migration ${migration.version} failed:`, e.message);
        throw e;
      }
    }

    console.log(`Migrations complete: ${applied} applied, ${skipped} skipped`);
    return { applied, skipped };
  }

  /**
   * Create a new migration file
   */
  static createMigration(name: string): void {
    const migrationsDir = path.join(__dirname, '../migrations');
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
    }

    const files = fs.readdirSync(migrationsDir);
    const nextVersion = files.length + 1;
    const fileName = `${nextVersion.toString().padStart(3, '0')}_${name}.ts`;
    const filePath = path.join(migrationsDir, fileName);

    const content = `export const version = ${nextVersion};
export const name = '${name}';

export async function up(adapter: any): Promise<void> {
  // TODO: Implement migration
  console.log('Running migration ${nextVersion}: ${name}');
}

export async function down(adapter: any): Promise<void> {
  // TODO: Implement rollback
  console.log('Rolling back migration ${nextVersion}: ${name}');
}
`;

    fs.writeFileSync(filePath, content);
    console.log(`Created migration: ${fileName}`);
  }
}

export const migrationManager = new MigrationManager();

/**
 * Run migrations on server boot
 */
export async function runMigrations(): Promise<void> {
  try {
    await migrationManager.runMigrations();
  } catch (e: any) {
    console.error('Migration failed, but continuing boot:', e.message);
  }
}

export default MigrationManager;
