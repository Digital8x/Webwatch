import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import crypto from 'crypto';

// Rate limiter state
const rateLimitMap = new Map<string, { attempts: number, resetAt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

function secureCompare(a: string, b: string) {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA); // Prevent timing attack on length
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || req.ip || 'unknown';
  const now = Date.now();
  
  // Clean up old entries
  rateLimitMap.forEach((val, key) => {
    if (val.resetAt < now) rateLimitMap.delete(key);
  });

  const rateLimit = rateLimitMap.get(ip);
  if (rateLimit && rateLimit.attempts >= MAX_ATTEMPTS) {
    if (rateLimit.resetAt > now) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    } else {
      rateLimitMap.delete(ip);
    }
  }

  try {
    const { password } = await req.json();
    
    if (typeof password !== 'string' || !password.trim()) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const masterPassword = process.env.WEBWATCH_PASSWORD;
    if (!masterPassword) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    if (!secureCompare(password, masterPassword)) {
      const attempts = (rateLimitMap.get(ip)?.attempts || 0) + 1;
      rateLimitMap.set(ip, { attempts, resetAt: now + LOCKOUT_MS });
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // Reset rate limit on success
    rateLimitMap.delete(ip);

    // Secret for signing JWT
    const secret = new TextEncoder().encode(masterPassword);

    // Create JWT token
    const token = await new SignJWT({ auth: true })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secret);

    const response = NextResponse.json({ success: true });
    
    // Set HttpOnly cookie
    response.cookies.set({
      name: 'webwatch_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Login route error:', error.message, error.stack || error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
