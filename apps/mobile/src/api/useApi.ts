// Load data for a screen. Kept tiny on purpose; a cache library can replace it once screens share data.
import { useCallback, useEffect, useRef, useState } from 'react';

export function useApi<T>(load: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | undefined>();
  const [error, setError] = useState<Error | undefined>();
  const [loading, setLoading] = useState(true);
  const latest = useRef(0);

  const reload = useCallback(async () => {
    const run = ++latest.current;
    setLoading(true);
    try {
      const result = await load();
      if (run === latest.current) { setData(result); setError(undefined); }
    } catch (e) {
      if (run === latest.current) setError(e as Error);
    } finally {
      if (run === latest.current) setLoading(false);
    }
  }, deps);

  useEffect(() => { reload(); }, [reload]);
  return { data, error, loading, reload, setData };
}
