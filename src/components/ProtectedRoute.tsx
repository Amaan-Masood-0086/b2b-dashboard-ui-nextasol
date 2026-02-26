import { Navigate } from 'react-router-dom';
import { useAuthStore, UserRole } from '@/stores/auth-store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ADMIN_ROLES: UserRole[] = ['super_admin', 'billing_admin', 'support_admin'];

function getDefaultRoute(role: UserRole): string {
  if (ADMIN_ROLES.includes(role)) return '/admin';
  if (role === 'cashier') return '/pos';
  return '/';
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultRoute(user.role)} replace />;
  }

  return <>{children}</>;
}
