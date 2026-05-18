import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Extract the Authorization header
  const basicAuth = req.headers.get('authorization');
  
  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [user, pwd] = Buffer.from(authValue, 'base64').toString().split(':');

    // Master username and password for your Server Engine
    const masterPassword = process.env.WEBWATCH_PASSWORD || 'WebWatch2026!';
    if (user === 'admin' && pwd === masterPassword) {
      return NextResponse.next();
    }
  }

  // If no auth or invalid auth, return 401 and prompt for password
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure WebWatch Dashboard"',
    },
  });
}

export const config = {
  // Apply to all routes EXCEPT the cron endpoint, Next.js static files, and images
  matcher: ['/((?!api/checks/run|_next/static|_next/image|favicon.ico).*)'],
};
