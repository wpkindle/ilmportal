import { NextResponse } from 'next/server';

export function middleware(request) {
  const host = request.headers.get('host') || '';

  // Redirect legacy vercel.app or ilmportal domain to official ilmidunya.com domain
  if (
    host === 'ilmportal.vercel.app' ||
    (host.endsWith('.vercel.app') && !host.includes('localhost') && !host.includes('127.0.0.1'))
  ) {
    const url = request.nextUrl.clone();
    url.protocol = 'https:';
    url.host = 'ilmidunya.com';
    url.port = '';
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled by rewrites/backend)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icon.svg, icon.png, robots.txt, sitemap.xml
     */
    '/((?!api|_next/static|_next/image|favicon.ico|icon.svg|icon.png|robots.txt|sitemap.xml).*)',
  ],
};

