import { create } from 'zustand';

export type UserRole = 'super_admin' | 'billing_admin' | 'support_admin' | 'root_owner' | 'branch_manager' | 'cashier';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  merchantId?: string;
  branchId?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
  selectedBranchId: string | null;
  setSelectedBranchId: (id: string) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const storedToken = localStorage.getItem('accessToken');
  const storedUser = localStorage.getItem('user');

  return {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken,
    isAuthenticated: !!storedToken,
    selectedBranchId: localStorage.getItem('selectedBranchId'),

    login: (token, user) => {
      localStorage.setItem('accessToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ token, user, isAuthenticated: true, selectedBranchId: user.branchId || null });
      if (user.branchId) localStorage.setItem('selectedBranchId', user.branchId);
    },

    logout: () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.removeItem('selectedBranchId');
      set({ token: null, user: null, isAuthenticated: false, selectedBranchId: null });
    },

    setUser: (user) => {
      localStorage.setItem('user', JSON.stringify(user));
      set({ user });
    },

    setSelectedBranchId: (id) => {
      localStorage.setItem('selectedBranchId', id);
      set({ selectedBranchId: id });
    },
  };
});
