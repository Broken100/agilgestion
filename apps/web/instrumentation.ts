export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { initDb } = await import('@agilgestion/infrastructure');
      await initDb();
    } catch (error) {
      console.warn('[instrumentation] DB init skipped:', error instanceof Error ? error.message : error);
    }
  }
}