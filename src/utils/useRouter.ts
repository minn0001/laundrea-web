import { useState, useEffect, useCallback } from 'react';

export function useRouter() {
  const [pathname, setPathname] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  useEffect(() => {
    const handleLocationChange = () => {
      setPathname(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const navigate = useCallback((to: string) => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname !== to) {
        window.history.pushState({}, '', to);
        setPathname(to);
        window.dispatchEvent(new Event('popstate'));
      }
    }
  }, []);

  const isStaff = pathname.startsWith('/staff');

  return { pathname, navigate, isStaff };
}
