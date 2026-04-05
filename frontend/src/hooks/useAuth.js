import { useStore } from '../store/useStore';

/**
 * A custom hook to easily access the mock authentication context
 * This behaves similarly to how a real useAuth() hook would work.
 */
export function useAuth() {
  const currentUser = useStore((state) => state.currentUser);
  const setCurrentUser = useStore((state) => state.setCurrentUser);
  const logout = useStore((state) => state.logout);

  return {
    currentUser,
    setCurrentUser,
    logout,
    isAuthenticated: !!currentUser,
  };
}
