import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '@/types/product';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      
      login: async (email: string, password: string) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Demo user for testing
        if (email === 'demo@purebite.com' && password === 'password') {
          const user: User = {
            id: '1',
            email: 'demo@purebite.com',
            name: 'Demo User',
            phone: '+8801234567890',
            role: UserRole.USER,
            addresses: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          set({ user, isAuthenticated: true });
          return true;
        }
        
        return false;
      },
      
      register: async (userData) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const user: User = {
          ...userData,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set({ user, isAuthenticated: true });
        return true;
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      
      updateProfile: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            ...userData,
            updatedAt: new Date(),
          };
          set({ user: updatedUser });
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);