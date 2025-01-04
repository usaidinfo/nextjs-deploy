'use client'
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ComponentType } from 'react';

export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const isAuthenticated = () => !!getToken();

export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.clear();
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }
};

export function withAuth<P extends object>(Component: ComponentType<P>) {
  return function ProtectedRoute(props: P) {
    const router = useRouter();
    const [isAuthed, setIsAuthed] = useState(false);
    
    useEffect(() => {
      if (!isAuthenticated()) {
        router.push('/login');
      } else {
        setIsAuthed(true);
      }
    }, [router]);

    if (!isAuthed) {
      return null;
    }

    return <Component {...props} />;
  };
}