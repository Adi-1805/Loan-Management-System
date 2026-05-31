'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { authStore } from '@/store/auth.store';
import { ROLE_HOME } from '@/lib/constants';
import { User } from '@/types';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = authStore.getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await authService.me();
      const u = res.data.data.user;
      const normalized: User = {
        id: (u as User & { _id?: string }).id || (u as User & { _id?: string })._id || '',
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
      };
      setUser(normalized);
      authStore.setAuth(token, normalized);
    } catch {
      authStore.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cached = authStore.getUser();
    if (cached) setUser(cached);
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const res = await authService.login({ email, password });
    const { token, user: u } = res.data.data;
    const normalized: User = {
      id: (u as User & { _id?: string }).id || (u as User & { _id?: string })._id || '',
      name: u.name,
      email: u.email,
      role: u.role,
    };
    authStore.setAuth(token, normalized);
    setUser(normalized);
    toast.success('Login successful');
    router.push(ROLE_HOME[normalized.role]);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await authService.register({ name, email, password });
    const { token, user: u } = res.data.data;
    const normalized: User = {
      id: (u as User & { _id?: string }).id || (u as User & { _id?: string })._id || '',
      name: u.name,
      email: u.email,
      role: u.role,
    };
    authStore.setAuth(token, normalized);
    setUser(normalized);
    toast.success('Registration successful');
    router.push(ROLE_HOME[normalized.role]);
  };

  const logout = () => {
    authStore.clear();
    setUser(null);
    router.push('/login');
    toast.success('Logged out');
  };

  return { user, loading, login, register, logout, refreshUser };
};
