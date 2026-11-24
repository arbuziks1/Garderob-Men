import { createContext, useContext, useState, type ReactNode } from 'react';
import { api, getCustomerToken } from '../services/api';

interface CustomerAuthContextValue {
  isLoggedIn: boolean;
  phone: string | null;
  error: string | null;
  login: (phone: string, password: string) => Promise<boolean>;
  register: (phone: string, password: string) => Promise<boolean>;
  logout: () => void;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  // Optimistically trust a stored token rather than calling /me to confirm on every load —
  // an expired/invalid token surfaces the first time getMyOrders() 401s, which clears it.
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!getCustomerToken());
  const [phone, setPhone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const login = async (p: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      const { phone: confirmedPhone } = await api.customerLogin(p, password);
      setPhone(confirmedPhone);
      setIsLoggedIn(true);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось войти. Попробуйте ещё раз.');
      return false;
    }
  };

  const register = async (p: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      const { phone: confirmedPhone } = await api.customerRegister(p, password);
      setPhone(confirmedPhone);
      setIsLoggedIn(true);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось зарегистрироваться. Попробуйте ещё раз.');
      return false;
    }
  };

  const logout = () => {
    api.customerLogout();
    setIsLoggedIn(false);
    setPhone(null);
  };

  const value: CustomerAuthContextValue = {
    isLoggedIn,
    phone,
    error,
    login,
    register,
    logout,
    isDrawerOpen,
    openDrawer: () => setDrawerOpen(true),
    closeDrawer: () => setDrawerOpen(false),
  };

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
}

export function useCustomerAuth(): CustomerAuthContextValue {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  return ctx;
}
