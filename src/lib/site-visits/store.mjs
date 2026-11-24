import { join } from 'node:path';
import { openCounter } from './counter.mjs';

const storeKey = Symbol.for('ventureproof.siteVisitCounter.v1');
export function visitorStore() {
  if (process.env.SITE_VISITS_ENABLED !== '1' || process.env.DATA_DIR !== '/data') {
    throw Error('site_visits_disabled');
  }
  if (!globalThis[storeKey]) {
    const counter = openCounter({
      appId: 'ventureproof-ai', origin: 'https://ventureproof.seymata.com',
      root: join(process.env.DATA_DIR, 'site-visits')
    });
    counter.exportSnapshot(Date.now());
    const timer = setInterval(() => {
      try { counter.exportSnapshot(Date.now()); } catch { console.error('site_visit_export_failed'); }
    }, 60000);
    timer.unref();
    globalThis[storeKey] = counter;
  }
  return globalThis[storeKey];
}
