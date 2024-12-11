import { useRouter } from 'next/navigation';
import { logout } from '../utils/auth';

export const useAuth = () => {
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return { handleLogout };
};