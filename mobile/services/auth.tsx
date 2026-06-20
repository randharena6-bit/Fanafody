import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as api from './api';

const TOKEN_KEY = 'fanafody_token';

async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

async function setToken(token: string | null) {
  if (Platform.OS === 'web') {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
    return;
  }
  if (token) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

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
    (async () => {
      const stored = await getToken();
      if (stored) {
        api.setToken(stored);
        try {
          const user = await api.getMe();
          setState({ user, token: stored, loading: false });
          return;
        } catch {
          await setToken(null);
        }
      }
      setState({ user: null, token: null, loading: false });
    })();
  }, []);

  async function signIn(email: string, password: string) {
    const res = await api.login(email, password);
    api.setToken(res.token);
    await setToken(res.token);
    setState({ user: res.user, token: res.token, loading: false });
  }

  async function signUp(email: string, password: string, name: string, phone?: string) {
    const res = await api.register(email, password, name, phone);
    api.setToken(res.token);
    await setToken(res.token);
    setState({ user: res.user, token: res.token, loading: false });
  }

  function signOut() {
    api.setToken(null);
    setToken(null);
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
