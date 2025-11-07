export async function postVisit(apiBase?: string) {
  try {
    const base = apiBase || (import.meta.env.VITE_API_BASE as string) || 'http://localhost:3001';
    // Fire-and-forget POST to /api/metrics/visit. Backend performs origin checks.
    await fetch(`${base}/api/metrics/visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // no body needed; keep it simple for future extension
      body: JSON.stringify({}),
    });
  } catch (e) {
    // swallow errors - metrics must never break UX
  }
}
