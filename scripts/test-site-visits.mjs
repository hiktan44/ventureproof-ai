import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { openCounter, localDay } from '../src/lib/site-visits/counter.mjs';

test('VentureProof daily browser counts stay local and export only totals', t => {
  const root = mkdtempSync(join(tmpdir(), 'ventureproof-site-visits-'));
  const now = Date.parse('2026-11-24T09:00:00Z');
  const counter = openCounter({ root, appId: 'ventureproof-ai', origin: 'https://ventureproof.seymata.com', clock: () => now });
  t.after(() => { counter.close(); rmSync(root, {recursive: true, force: true}); });
  const day = localDay(now), first = randomUUID();
  for (const id of [first, first, randomUUID()]) assert.equal(counter.record(day, id, now), true);
  assert.equal(counter.record('2026-11-23', first, now), false);
  counter.exportSnapshot(now + 300000);
  const raw = readFileSync(join(root,'out','website-visitors.json'),'utf8');
  const snapshot = JSON.parse(raw);
  assert.equal(snapshot.appId,'ventureproof-ai');
  assert.ok(snapshot.windows.some(w => w.allBrowsers.value === 2));
  assert.equal(raw.includes(first), false);
});
