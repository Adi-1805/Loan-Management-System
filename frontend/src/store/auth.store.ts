'use client';

import Cookies from 'js-cookie';
import { TOKEN_KEY, USER_KEY } from '@/lib/constants';
import { User } from '@/types';

export const authStore = {
  setAuth: (token: string, user: User) => {
    Cookies.set(TOKEN_KEY, token, { expires: 7 });
    Cookies.set(USER_KEY, JSON.stringify(user), { expires: 7 });
  },

  getToken: (): string | undefined => Cookies.get(TOKEN_KEY),

  getUser: (): User | null => {
    const raw = Cookies.get(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },

  clear: () => {
    Cookies.remove(TOKEN_KEY);
    Cookies.remove(USER_KEY);
  },
};
