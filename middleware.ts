import { NextResponse, type NextRequest } from 'next/server';

/* Convenience redirect only: an unauthenticated visit to /admin lands on the
   login screen instead of a broken page. This is NOT the security boundary —
   every admin page and API route re-verifies the JWT server-side before
   reading or writing anything (hard rule 2). Full verification does not run
   here because middleware sees every matched request and the signature check
   belongs next to the data operation. */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const hasCookie = request.cookies.has('orkay-admin');
    if (!hasCookie) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
