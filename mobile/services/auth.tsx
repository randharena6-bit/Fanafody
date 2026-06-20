import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as api from './api';

interface AuthState {
  user: api.User | null;
  token: string | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, phone?: string) => Promise<void>;
  signOut: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, token: null, loading: true });

  useEffect(() => {
    const stored = localStorage.getItem('fanafody_token');
    if (stored) {
      api.setToken(stored);
      api.getMe()
        .then((user) => setState({ user, token: stored, loading: false }))
        .catch(() => {
          localStorage.removeItem('fanafody_token');
          setState({ user: null, token: null, loading: false });
        });
    } else {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  async function signIn(email: string, password: string) {
    const res = await api.login(email, password);
    api.setToken(res.token);
    localStorage.setItem('fanafody_token', res.token);
    setState({ user: res.user, token: res.token, loading: false });
  }

  async function signUp(email: string, password: string, name: string, phone?: string) {
    const res = await api.register(email, password, name, phone);
    api.setToken(res.token);
    localStorage.setItem('fanafody_token', res.token);
    setState({ user: res.user, token: res.token, loading: false });
  }

  function signOut() {
    api.setToken(null);
    localStorage.removeItem('fanafody_token');
    setState({ user: null, token: null, loading: false });
  }

  async function refreshUser() {
    try {
      const user = await api.getMe();
      setState((s) => ({ ...s, user }));
    } catch { }
  }

  return (
    <AuthContext.Provider value={{ ...state, signIn, signUp, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
