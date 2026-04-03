import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthUser = {
  name: string;
  phoneNumber: string;
};

type AuthContextType = {
  token: string | null;
  user: AuthUser | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
};

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_KEY = 'auth_user';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    AsyncStorage.multiGet([AUTH_TOKEN_KEY, AUTH_USER_KEY]).then(pairs => {
      const storedToken = pairs[0][1];
      const storedUser = pairs[1][1];
      if (storedToken) setToken(storedToken);
      if (storedUser) {
        try { setUser(JSON.parse(storedUser)); } catch {}
      }
    });
  }, []);

  const login = async (t: string, u: AuthUser) => {
    setToken(t);
    setUser(u);
    await AsyncStorage.multiSet([
      [AUTH_TOKEN_KEY, t],
      [AUTH_USER_KEY, JSON.stringify(u)],
    ]);
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_USER_KEY, 'vendor_stores']);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
