import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Hook to check if the current user has the required role(s)
 * @param requiredRoles - Array of roles that are allowed to access the component
 * @param redirectTo - Path to redirect to if user doesn't have the required role
 * @returns Object containing isAuthorized flag and loading state
 */
export const useAuthorization = (
  requiredRoles: string[],
  redirectTo: string = '/restricted'
) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // Wait until auth state is loaded
    if (isLoading) return;
    
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    
    // If authenticated but doesn't have the required role
    if (user && !requiredRoles.includes(user.role)) {
      // Build the redirect URL with query parameters
      const url = new URL(redirectTo, window.location.origin);
      url.searchParams.set('role', requiredRoles.join(' or '));
      url.searchParams.set('returnUrl', window.location.pathname);
      
      router.push(url.toString());
    }
  }, [user, isLoading, isAuthenticated, requiredRoles, redirectTo, router]);
  
  // Return authorization status
  return {
    isAuthorized: !isLoading && isAuthenticated && user && requiredRoles.includes(user.role),
    isLoading,
  };
};

/**
 * Check if a user has the required role
 * @param user - User object
 * @param requiredRoles - Array of roles to check against
 * @returns Boolean indicating if the user has one of the required roles
 */
export const hasRequiredRole = (
  user: { role: string } | null | undefined,
  requiredRoles: string[]
): boolean => {
  if (!user) return false;
  return requiredRoles.includes(user.role);
};
