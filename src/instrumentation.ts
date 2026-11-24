export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs' || process.env.SITE_VISITS_ENABLED !== '1') return;
  try {
    const { visitorStore } = await import('./lib/site-visits/store.mjs');
    visitorStore();
  } catch {
    console.error('site_visit_counter_unavailable');
  }
}
