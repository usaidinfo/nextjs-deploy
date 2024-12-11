'use client'
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ComponentType } from 'react';

export const getToken = () => localStorage.getItem('token');
export const isAuthenticated = () => !!getToken();

export function withAuth<P extends object>(Component: ComponentType<P>) {
  return function ProtectedRoute(props: P) {
    const router = useRouter();
    
    useEffect(() => {
      if (!isAuthenticated()) {
        router.push('/login');
      }
    }, []);

    return <Component {...props} />;
  };
}

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.clear();
  
};