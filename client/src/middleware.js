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

  const { pathname, search } = request.nextUrl;
  const authCookie = request.cookies.get('ilm_auth')?.value;
  const roleCookie = request.cookies.get('ilm_role')?.value;
  const fullPath = `${pathname}${search}`;

  // 1. Protect Tutor portal routes: /tutor and /tutor/*
  // NOTE: /tutors (public directory) and /tutors/[id] (public student-facing profile) must remain public!
  if (pathname === '/tutor' || pathname.startsWith('/tutor/')) {
    if (!authCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('role', 'tutor');
      loginUrl.searchParams.set('redirect', fullPath);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Protect Student portal routes: /student and /student/*
  if (pathname === '/student' || pathname.startsWith('/student/')) {
    if (!authCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('role', 'student');
      loginUrl.searchParams.set('redirect', fullPath);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Protect Admin portal routes: /admin and /admin/* (except /admin/login)
  if ((pathname === '/admin' || pathname.startsWith('/admin/')) && pathname !== '/admin/login') {
    if (!authCookie || roleCookie !== 'admin') {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', fullPath);
      return NextResponse.redirect(loginUrl);
    }
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

