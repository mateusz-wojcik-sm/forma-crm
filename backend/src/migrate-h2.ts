import 'reflect-metadata';
import { execFileSync } from 'node:child_process';
import { constants, copyFileSync, existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { config } from './config';
import { BusinessRecord, STATUSES } from './records/business-record';
import { RecordDto } from './records/record.dto';
import { RecordsRepository } from './records/records.repository';

interface H2Export { nextId: number; records: BusinessRecord[] }

export function validateExport(value: unknown): H2Export {
  if (!value || typeof value !== 'object') throw new Error('Invalid H2 export.');
  const { records, nextId } = value as H2Export;
  if (!Array.isArray(records) || !Number.isSafeInteger(nextId) || nextId < 1) {
    throw new Error('Invalid H2 records or identity counter.');
  }
  const ids = new Set<number>();
  for (const record of records) {
    if (!record || typeof record !== 'object' || !Number.isSafeInteger(record.id) || record.id < 1 ||
        record.id >= nextId || ids.has(record.id)) throw new Error('Invalid or duplicate H2 record ID.');
    const errors = validateSync(plainToInstance(RecordDto, record));
    const statuses: readonly string[] | undefined = STATUSES[record.type];
    if (errors.length || !statuses?.includes(record.status)) {
      throw new Error(`H2 record ${record.id} failed validation; the source database has not been changed.`);
    }
    ids.add(record.id);
  }
  return { records, nextId };
}

export function migrateH2(options: { source: string; target: string; jar: string; helper: string }): number {
  const source = resolve(options.source).replace(/\.mv\.db$/, '');
  const target = resolve(options.target);
  if (!existsSync(`${source}.mv.db`)) throw new Error(`H2 database not found: ${source}.mv.db`);
  if (existsSync(target)) throw new Error(`Refusing to overwrite ${target}. Back up and move it before migrating.`);
  if (!existsSync(options.jar)) throw new Error('H2 2.3.232 driver not found. Pass --h2-jar <path-to-h2-2.3.232.jar>.');

  const temporary = mkdtempSync(join(tmpdir(), 'forma-h2-migration-'));
  let repository: RecordsRepository | undefined;
  try {
    const exported = join(temporary, 'records.json');
    execFileSync('java', ['--class-path', resolve(options.jar), resolve(options.helper), source, exported], { stdio: 'pipe' });
    const snapshot = validateExport(JSON.parse(readFileSync(exported, 'utf8')));
    const staging = join(temporary, 'forma.sqlite');
    repository = new RecordsRepository({ path: staging, seed: false, allowLegacy: true });
    repository.importRecords(snapshot.records, snapshot.nextId);
    if (!isDeepStrictEqual(repository.list(), [...snapshot.records].sort((a, b) => a.id - b.id))) {
      throw new Error('Migration verification failed; no target database was published.');
    }
    repository.onModuleDestroy();
    repository = undefined;
    // Exclusive copies never overwrite the original backup or an existing target.
    const backup = join(dirname(source), `${basename(source)}.mv.db.pre-nest-backup`);
    if (!existsSync(backup)) copyFileSync(`${source}.mv.db`, backup, constants.COPYFILE_EXCL);
    copyFileSync(staging, target, constants.COPYFILE_EXCL);
    return snapshot.records.length;
  } finally {
    repository?.onModuleDestroy();
    rmSync(temporary, { recursive: true, force: true });
  }
}

if (require.main === module) {
  try {
    const args = process.argv.slice(2);
    const allowed = new Set(['--source', '--target', '--h2-jar']);
    if (args.length % 2 || args.some((value, index) => index % 2 === 0 && !allowed.has(value))) {
      throw new Error('Usage: npm run migrate:h2 -- [--source <H2 path without .mv.db>] [--target <SQLite path>] [--h2-jar <driver.jar>]');
    }
    const option = (name: string, fallback: string) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
    const count = migrateH2({
      source: option('--source', join(dirname(config.databasePath), 'forma')),
      target: option('--target', config.databasePath),
      jar: option('--h2-jar', join(homedir(), '.m2/repository/com/h2database/h2/2.3.232/h2-2.3.232.jar')),
      helper: resolve(__dirname, '../scripts/ExportH2.java'),
    });
    console.log(`Migrated and verified ${count} records. H2 data and its backup are preserved.`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
