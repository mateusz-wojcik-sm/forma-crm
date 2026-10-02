import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { BusinessRecord, RecordInput } from './business-record';
import { SEED_RECORDS } from './seed-data';

export const DATABASE_OPTIONS = Symbol('DATABASE_OPTIONS');
export interface DatabaseOptions { path: string; seed?: boolean; allowLegacy?: boolean }

const COLUMNS = 'type, name, company, email, status, amount_cents, date, owner, quantity, notes';
type StoredRecord = Omit<BusinessRecord, 'amount'> & { amount_cents: number };

@Injectable()
export class RecordsRepository implements OnModuleDestroy {
  private readonly database: DatabaseSync;

  constructor(@Inject(DATABASE_OPTIONS) options: DatabaseOptions) {
    if (options.path !== ':memory:') {
      // Never silently replace an existing H2 workspace with demo records.
      if (!options.allowLegacy && !existsSync(options.path) &&
          existsSync(join(dirname(options.path), 'forma.mv.db'))) {
        throw new Error('Existing H2 data found. Run npm --prefix backend run migrate:h2 before starting NestJS.');
      }
      mkdirSync(dirname(options.path), { recursive: true });
    }
    this.database = new DatabaseSync(options.path);
    try {
      this.database.exec(`
        PRAGMA busy_timeout = 5000;
        CREATE TABLE IF NOT EXISTS business_record (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL, name TEXT NOT NULL, company TEXT NOT NULL,
          email TEXT, status TEXT NOT NULL,
          amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
          date TEXT NOT NULL, owner TEXT NOT NULL,
          quantity INTEGER NOT NULL CHECK (quantity >= 0), notes TEXT
        );
      `);
      if (options.seed !== false) {
        this.transaction(() => {
          if (this.list().length === 0) {
            for (const record of SEED_RECORDS) this.create(record);
          }
        });
      }
    } catch (error) {
      this.database.close();
      throw error;
    }
  }

  private values(record: RecordInput) {
    // Integer cents retain BigDecimal's monetary precision in persistent storage.
    return [record.type, record.name, record.company, record.email ?? null,
      record.status, Math.round(record.amount * 100), record.date, record.owner,
      record.quantity, record.notes ?? null];
  }

  private fromRow(row: StoredRecord): BusinessRecord {
    const { amount_cents, ...record } = row;
    return { ...record, amount: amount_cents / 100 };
  }

  list(): BusinessRecord[] {
    return (this.database.prepare('SELECT * FROM business_record ORDER BY id').all() as unknown as StoredRecord[])
      .map(row => this.fromRow(row));
  }

  find(id: number): BusinessRecord | undefined {
    const row = this.database.prepare('SELECT * FROM business_record WHERE id = ?').get(id) as unknown as StoredRecord | undefined;
    return row && this.fromRow(row);
  }

  create(record: RecordInput): BusinessRecord {
    const result = this.database.prepare(`INSERT INTO business_record (${COLUMNS}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(...this.values(record));
    return this.find(Number(result.lastInsertRowid))!;
  }

  update(id: number, record: RecordInput): BusinessRecord {
    this.database.prepare(`UPDATE business_record SET ${COLUMNS.split(', ').map(column => `${column} = ?`).join(', ')} WHERE id = ?`)
      .run(...this.values(record), id);
    return this.find(id)!;
  }

  delete(id: number): void {
    this.database.prepare('DELETE FROM business_record WHERE id = ?').run(id);
  }

  importRecords(records: BusinessRecord[], nextId: number): void {
    this.transaction(() => {
      if (this.list().length) throw new Error('Refusing to overwrite a populated SQLite database.');
      const statement = this.database.prepare(`INSERT INTO business_record (id, ${COLUMNS}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      for (const record of records) statement.run(record.id, ...this.values(record));
      // Preserve H2's identity counter, including IDs of deleted records.
      this.database.prepare("DELETE FROM sqlite_sequence WHERE name = 'business_record'").run();
      this.database.prepare("INSERT INTO sqlite_sequence (name, seq) VALUES ('business_record', ?)").run(nextId - 1);
    });
  }

  private transaction(action: () => void): void {
    this.database.exec('BEGIN IMMEDIATE');
    try {
      action();
      this.database.exec('COMMIT');
    } catch (error) {
      this.database.exec('ROLLBACK');
      throw error;
    }
  }

  onModuleDestroy(): void { this.database.close(); }
}
