import 'reflect-metadata';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test, TestContext } from 'node:test';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';
import { BusinessRecord, RecordInput, STATUSES } from '../src/records/business-record';
import { DATABASE_OPTIONS, RecordsRepository } from '../src/records/records.repository';
import { SEED_RECORDS } from '../src/records/seed-data';

const sample: RecordInput = {
  type: 'customers', name: 'Test Customer', company: 'Test Co', email: 'test@example.com',
  status: 'Lead', amount: 100, date: '2026-10-01', owner: 'Alex Morgan', quantity: 0, notes: 'Test notes',
};

async function server(context: TestContext, path = ':memory:') {
  const module = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(DATABASE_OPTIONS).useValue({ path }).compile();
  const app = module.createNestApplication({ logger: false });
  configureApp(app);
  await app.listen(0, '127.0.0.1');
  let closed = false;
  const close = async () => { if (!closed) { closed = true; await app.close(); } };
  context.after(close);
  const url = await app.getUrl();
  const request = (method: string, suffix = '', body?: unknown) => fetch(`${url}/api/records${suffix}`, {
    method, headers: { 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return { request, close };
}

test('preserves all 31 seeds, module counts, dashboard totals and invoice months', async context => {
  const { request } = await server(context);
  const response = await request('GET');
  assert.equal(response.status, 200);
  const records = await response.json() as BusinessRecord[];
  assert.equal(records.length, 31);
  assert.deepEqual(records.map(({ id, ...record }) => record), SEED_RECORDS);
  assert.deepEqual(Object.keys(STATUSES).map(type => records.filter(r => r.type === type).length), [7, 7, 9, 4, 4]);
  assert.equal(records.filter(r => r.type === 'invoices' && r.status === 'Paid').reduce((sum, r) => sum + r.amount, 0), 163000);
  assert.deepEqual(records.filter(r => r.type === 'invoices' && r.status === 'Paid').map(r => r.date),
    ['2026-04-15', '2026-05-15', '2026-06-15', '2026-07-15', '2026-08-15', '2026-09-15']);
});

test('CRUD works for all modules and every original status; client IDs and unknown fields are ignored', async context => {
  const { request } = await server(context);
  for (const [type, statuses] of Object.entries(STATUSES)) {
    const created = await request('POST', '', { ...sample, type, status: statuses[0], id: 1, unexpected: 'ignored' });
    assert.equal(created.status, 201);
    const saved = await created.json() as BusinessRecord;
    assert.ok(saved.id > 31);
    assert.equal('unexpected' in saved, false);
    for (const status of statuses) {
      const response = await request('PUT', `/${saved.id}`, { ...saved, id: 99999, status });
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), { ...saved, status });
    }
    const removed = await request('DELETE', `/${saved.id}`);
    assert.equal(removed.status, 204);
    assert.equal(await removed.text(), '');
    assert.equal((await request('DELETE', `/${saved.id}`)).status, 404);
    assert.equal((await request('PUT', `/${saved.id}`, saved)).status, 404);
  }
});

test('rejects invalid fields on both POST and PUT without changing saved data', async context => {
  const { request } = await server(context);
  const saved = await (await request('POST', '', sample)).json() as BusinessRecord;
  const invalid: Record<string, unknown>[] = [
    { type: 'unknown' }, { type: null }, { name: '' }, { name: ' \t\n' }, { name: 'x'.repeat(121) },
    { name: null }, { company: '' }, { company: 'x'.repeat(121) }, { owner: ' ' }, { owner: 'x'.repeat(81) },
    { email: 'invalid' }, { email: 'a'.repeat(150) + '@example.com' }, { email: 123 },
    { status: '' }, { status: 'Paid' }, { status: 'x'.repeat(41) },
    { amount: -1 }, { amount: 1.001 }, { amount: 10000000000 }, { amount: null }, { amount: 'abc' },
    { quantity: -1 }, { quantity: 1.5 }, { quantity: 2147483648 }, { quantity: null },
    { date: '2026-02-29' }, { date: '2026-02-30' }, { date: '2026-13-01' }, { date: 'not-a-date' },
    { date: '2026-10-01T12:00:00Z' }, { date: null }, { notes: 'x'.repeat(2001) }, { notes: {} },
  ];
  for (const patch of invalid) {
    for (const [method, suffix] of [['POST', ''], ['PUT', `/${saved.id}`]]) {
      const response = await request(method, suffix, { ...sample, ...patch });
      assert.equal(response.status, 400, `${method}: ${JSON.stringify(patch)}`);
      const error = await response.json() as { status: number; message: string; path: string };
      assert.equal(error.status, 400);
      assert.equal(typeof error.message, 'string');
      assert.equal(error.path, `/api/records${suffix}`);
    }
  }
  for (const key of ['type', 'name', 'company', 'status', 'amount', 'date', 'owner', 'quantity']) {
    const missing = { ...sample } as Record<string, unknown>;
    delete missing[key];
    assert.equal((await request('POST', '', missing)).status, 400, `missing ${key}`);
  }
  const records = await (await request('GET')).json() as BusinessRecord[];
  assert.equal(records.length, 32);
  assert.deepEqual(records.find(r => r.id === saved.id), saved);
});

test('preserves nullable fields, monetary limits, leap days and Unicode text', async context => {
  const { request } = await server(context);
  for (const amount of [0, 0.01, 0.29, 1.1, 9999999999.99]) {
    const input = { ...sample, amount, email: null, notes: null, date: '2028-02-29', name: 'Łódź 🧾', quantity: 2147483647 };
    const response = await request('POST', '', input);
    assert.equal(response.status, 201);
    const { id, ...saved } = await response.json() as BusinessRecord;
    assert.deepEqual(saved, input);
    assert.ok(id);
  }
  const { email, notes, ...withoutOptionalFields } = sample;
  const response = await request('POST', '', withoutOptionalFields);
  assert.equal(response.status, 201);
  const saved = await response.json() as BusinessRecord;
  assert.equal(saved.email, null);
  assert.equal(saved.notes, null);
  assert.equal((await request('POST', '', { ...sample, email: '' })).status, 201);
});

test('rejects type changes, missing records, malformed IDs and malformed JSON', async context => {
  const { request } = await server(context);
  const saved = await (await request('POST', '', sample)).json() as BusinessRecord;
  const response = await request('PUT', `/${saved.id}`, { ...sample, type: 'tasks', status: 'To do' });
  assert.equal(response.status, 400);
  assert.equal((await response.json() as { message: string }).message, 'Record type cannot be changed');
  for (const suffix of ['/no-id', '/1.5', '/9007199254740992']) {
    assert.equal((await request('DELETE', suffix)).status, 400);
    assert.equal((await request('PUT', suffix, sample)).status, 400);
  }
  assert.equal((await request('PUT', '/999999', sample)).status, 404);
  assert.equal((await request('DELETE', '/-1')).status, 404);
  for (const body of [null, [], {}, 'text']) assert.equal((await request('POST', '', body)).status, 400);
  const records = await (await request('GET')).json() as BusinessRecord[];
  assert.deepEqual(records.find(r => r.id === saved.id), saved);
});

test('persists edits, deletes, cents and IDs across restarts without duplicating seeds', async context => {
  const directory = mkdtempSync(join(tmpdir(), 'forma-persistence-'));
  const path = join(directory, 'forma.sqlite');
  // Cleanup after applications have released their database handles (Windows).
  try {
    const first = await server(context, path);
    const saved = await (await first.request('POST', '', { ...sample, amount: 0.29 })).json() as BusinessRecord;
    await first.request('PUT', `/${saved.id}`, { ...saved, status: 'Active' });
    await first.request('DELETE', '/1');
    await first.close();
    const second = await server(context, path);
    const records = await (await second.request('GET')).json() as BusinessRecord[];
    assert.equal(records.length, 31);
    assert.equal(records.some(r => r.id === 1), false);
    assert.deepEqual(records.find(r => r.id === saved.id), { ...saved, status: 'Active' });
    const next = await (await second.request('POST', '', sample)).json() as BusinessRecord;
    assert.ok(next.id > saved.id);
    for (const record of [...records, next]) await second.request('DELETE', `/${record.id}`);
    await second.close();
    const third = await server(context, path);
    const reseeded = await (await third.request('GET')).json() as BusinessRecord[];
    assert.deepEqual(reseeded.map(({ id, ...record }) => record), SEED_RECORDS);
    assert.ok(reseeded[0].id > next.id);
    await third.close();
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('refuses to seed over an unmigrated H2 workspace', () => {
  const directory = mkdtempSync(join(tmpdir(), 'forma-legacy-'));
  try {
    writeFileSync(join(directory, 'forma.mv.db'), 'legacy data');
    assert.throws(() => new RecordsRepository({ path: join(directory, 'forma.sqlite') }), /migrate:h2/);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
