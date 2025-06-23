import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes and their required roles
const protectedRoutes = [
  {
    path: '/dashboard/admin',
    roles: ['admin'],
  },
  {
    path: '/dashboard/provider',
    roles: ['provider', 'admin'],
  },
  {
    path: '/dashboard/user',
    roles: ['user', 'provider', 'admin'],
  },
];

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // TEMPORARILY DISABLED: Role-based access control
  // The authentication system uses localStorage instead of cookies
  // Client-side protection will be handled by the useAuthorization hook
  
  // Check if the route is protected
  const protectedRoute = protectedRoutes.find(route => 
    pathname.startsWith(route.path)
  );
  
  // Skip server-side auth checks since we're using localStorage
  // This prevents redirect loops
  
  // Add offline detection script to all HTML responses
  const response = NextResponse.next();
  
  // Only add the script to HTML responses
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('text/html')) {
    response.headers.append(
      'Link',
      '</offline-detection.js>; rel="prefetch"; as="script"'
    );
  }
  
  return response;
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Match all routes except static files, api routes, and _next
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
