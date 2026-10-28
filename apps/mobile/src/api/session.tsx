// Who is signed in. The token survives reloads; the demo player is loaded fresh each time.
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Player } from '@eday/api-types';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, setToken, signInDemo } from './client';

const KEY = 'eday.session.token';

interface Session {
  ready: boolean;
  player: Player | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<Session | null>(null);

const store = {
  get: async () => { try { return await AsyncStorage.getItem(KEY); } catch { return null; } },
  set: async (v: string | null) => { try { await (v ? AsyncStorage.setItem(KEY, v) : AsyncStorage.removeItem(KEY)); } catch { /* demo: memory only */ } },
};

export function SessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [player, setPlayer] = useState<Player | null>(null);

  useEffect(() => {
    (async () => {
      const saved = await store.get();
      if (saved) {
        setToken(saved);
        try { setPlayer(await api.getMe()); } catch { setToken(null); await store.set(null); }
      }
      setReady(true);
    })();
  }, []);

  const signIn = useCallback(async () => {
    const s = await signInDemo();
    setToken(s.token);
    await store.set(s.token);
    setPlayer(s.player);
  }, []);

  const signOut = useCallback(async () => {
    setToken(null);
    await store.set(null);
    setPlayer(null);
  }, []);

  const value = useMemo(() => ({ ready, player, signIn, signOut }), [ready, player, signIn, signOut]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const s = useContext(SessionContext);
  if (!s) throw new Error('useSession must be used inside SessionProvider');
  return s;
}
