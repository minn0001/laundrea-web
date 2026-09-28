import { useState, useEffect, useCallback } from 'react';

export function useRouter() {
  const [pathname, setPathname] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  const isStaff = pathname.startsWith('/staff');

  // Immediately synchronize document.title on initial load and render
  if (typeof document !== 'undefined') {
    const targetTitle = isStaff ? 'Laundrea Staff' : 'Laundrea';
    if (document.title !== targetTitle) {
      document.title = targetTitle;
    }
  }

  useEffect(() => {
    const handleLocationChange = () => {
      const current = window.location.pathname || '/';
      setPathname(current);
      const isStaffRoute = current.startsWith('/staff');
      document.title = isStaffRoute ? 'Laundrea Staff' : 'Laundrea';
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = isStaff ? 'Laundrea Staff' : 'Laundrea';
    }
  }, [isStaff]);

  const navigate = useCallback((to: string) => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname !== to) {
        window.history.pushState({}, '', to);
        setPathname(to);
        const nextIsStaff = to.startsWith('/staff');
        document.title = nextIsStaff ? 'Laundrea Staff' : 'Laundrea';
        window.dispatchEvent(new Event('popstate'));
      }
    }
  }, []);

  return { pathname, navigate, isStaff };
}

