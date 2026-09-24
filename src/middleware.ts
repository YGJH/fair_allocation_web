import { NextRequest, NextResponse } from 'next/server';
import { selectLocale } from './i18n/locale';
export function middleware(request:NextRequest){ const {pathname}=request.nextUrl; if(pathname.startsWith('/api')||pathname.startsWith('/_next')||pathname.includes('.')||pathname.startsWith('/en')||pathname.startsWith('/zh-TW')) return NextResponse.next(); const locale=selectLocale(request.headers.get('accept-language'),request.cookies.get('fair-locale')?.value); const url=request.nextUrl.clone(); url.pathname=`/${locale}${pathname==='/'?'':pathname}`; return NextResponse.redirect(url); }
export const config={matcher:['/((?!_next/static|_next/image|favicon.ico).*)']};
