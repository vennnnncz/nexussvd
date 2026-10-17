import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { auth } from '../lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null | undefined>(auth ? undefined : null);

  useEffect(() => {
    if (!auth) return undefined;
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  const login = async (email: string, password: string): Promise<string | null> => {
    if (!auth) return 'Login admin belum dikonfigurasi.';
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      return null;
    } catch {
      return 'Email atau password salah.';
    }
  };

  const logout = () => (auth ? signOut(auth) : Promise.resolve());

  return { user: user ?? null, loading: user === undefined, login, logout };
}
