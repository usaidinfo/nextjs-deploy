// // middleware.ts
// import { NextResponse } from 'next/server'
// import type { NextRequest } from 'next/server'

// // Protected routes
// const protectedRoutes = ['/dashboard', '/setup'];

// export function middleware(request: NextRequest) {
//   const pathname = request.nextUrl.pathname;
//   const token = request.cookies.get('token')?.value;
//   const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

//   if (isProtectedRoute && !token) {
//     const url = new URL('/login', request.url);
//     return NextResponse.redirect(url);
//   }

//   // If there's a token and user tries to access login/signup, redirect to dashboard
//   if (token && (pathname === '/login' || pathname === '/signup')) {
//     return NextResponse.redirect(new URL('/dashboard', request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     '/dashboard/:path*',
//     '/setup/:path*',
//     '/login',
//     '/signup'
//   ],
// };