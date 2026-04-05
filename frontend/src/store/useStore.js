import { create } from 'zustand';

export const useStore = create((set) => ({
  // Mock authentication state since the API doesn't have login/registration endpoints
  currentUser: null,
  
  // Action to change the active user context
  setCurrentUser: (user) => set({ currentUser: user }),
  
  // Action to clear the active user
  logout: () => set({ currentUser: null }),
}));
