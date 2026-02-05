import { useEffect, useState } from 'react';
import type { NavigateFunction } from 'react-router-dom';

type UseAuthUserOptions = {
  redirectPath?: string;
};

export const useAuthUser = (
  navigate: NavigateFunction,
  options: UseAuthUserOptions = {}
) => {
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const redirectPath = options.redirectPath ?? '/login';

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      navigate(redirectPath, { replace: true });
      setLoadingUser(false);
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setUser(parsed);
    } catch (err) {
      console.error('Error parsing user from localStorage', err);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      navigate(redirectPath, { replace: true });
    } finally {
      setLoadingUser(false);
    }
  }, [navigate, redirectPath]);

  return { user, loadingUser };
};
