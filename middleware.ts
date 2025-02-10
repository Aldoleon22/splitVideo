import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { sessionOptions } from '@/lib/session'
import { getIronSession } from 'iron-session'
import type { SessionData } from '@/lib/session'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const session = await getIronSession<SessionData>(req, res, sessionOptions)

  console.log('Middleware - Chemin actuel:', req.nextUrl.pathname)
  console.log('Middleware - Session:', session)

  // Ne pas interférer avec les routes API ou les ressources statiques
  if (req.nextUrl.pathname.startsWith('/api') || 
      req.nextUrl.pathname.startsWith('/_next') ||
      req.nextUrl.pathname.includes('.')) {
    console.log('Middleware - Passage direct (API ou ressource statique)')
    return res
  }

  if (!session.user) {
    if (req.nextUrl.pathname === '/auth') {
      console.log('Middleware - Accès à /auth sans session autorisé')
      return res
    }
    console.log('Middleware - Redirection vers /auth (pas de session)')
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  // L'utilisateur est authentifié, autoriser l'accès à toutes les pages sauf /auth
  if (req.nextUrl.pathname === '/auth') {
    console.log('Middleware - Redirection vers / (déjà authentifié)')
    return NextResponse.redirect(new URL('/', req.url))
  }

  console.log('Middleware - Passage à la suite')
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

