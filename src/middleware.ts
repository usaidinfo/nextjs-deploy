// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicPaths = ['/login', '/signup', '/setup','/forget-password'];
const publicFiles = ['/leafai-logo3.png', '/login-image.png', '/favicon.ico'];

const QR_SN_PATTERN = /\/ibn\/([a-zA-Z0-9]+)$/;


export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const match = pathname.match(QR_SN_PATTERN);
  if (match) {
    const sn = match[1];
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('setup', 'true');
    loginUrl.searchParams.set('sn', sn);
    return NextResponse.redirect(loginUrl);
  }
  
  // Allow static files and images
  if (publicFiles.includes(pathname)) {
    return NextResponse.next();
  }

  // Allow public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check for token
  const token = request.cookies.get('token')?.value;

  if (!token) {
    const url = new URL('/login', request.url);
    if (!pathname.startsWith('/login')) {
      url.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api routes
     * - _next (Next.js internals)
     * - static files (images, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
};