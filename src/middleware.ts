import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const masterPassword = process.env.WEBWATCH_PASSWORD;
if (!masterPassword) {
  throw new Error("WEBWATCH_PASSWORD is not set in environment variables");
}
const secret = new TextEncoder().encode(masterPassword);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('webwatch_session')?.value;
  
  if (token) {
    try {
      // Verify token
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch (error: any) {
      // Token is invalid or expired
      console.error('Token verification failed:', error.message, error.stack || error);
    }
  }

  // Redirect to login if unauthenticated
  const loginUrl = new URL('/login', req.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Apply to all routes EXCEPT specific public API routes, static files, login page, and images
  matcher: ['/((?!api/auth/login|api/auth/logout|api/checks/run|login|_next/static|_next/image|favicon.ico).*)'],
};
