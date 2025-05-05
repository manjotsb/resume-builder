import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // Create a response object
  const res = NextResponse.next();

  try {
    // Create a supabase client for middleware
    const supabase = createMiddlewareClient({ req, res });

    // Refresh session if expired - required for Server Components
    const { data: { session }, error } = await supabase.auth.getSession();
    
    // Debug logging
    console.log("Middleware session:", session);
    console.log("Session error:", error);
    console.log('Request URL:', req.url);
    console.log('Request cookies:', req.cookies.getAll());

    // Allow unauthenticated access to these routes
    const publicPaths = [
      '/login',
      '/signup',
      '/auth/callback',
      '/api/auth/callback',
      '/api/auth/signup',
      '/api/auth/login',
      '/api/auth/refresh'
    ];

    // If the user is not signed in and trying to access a protected route, redirect to /login
    if (
      !session &&
      !publicPaths.some(path => req.nextUrl.pathname.startsWith(path))
    ) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/login';
      return NextResponse.redirect(redirectUrl);
    }

    // If the user is signed in and tries to access /login or /signup, redirect to /dashboard
    if (
      session &&
      (req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/signup'))
    ) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/dashboard';
      return NextResponse.redirect(redirectUrl);
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    // In case of error, allow the request to proceed
    return res;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
