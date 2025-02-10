import { NextRequest, NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { sessionOptions } from '@/lib/session'
import type { SessionData } from '@/lib/session'

export async function GET(req: NextRequest) {
  const res = NextResponse.next()
  const session = await getIronSession<SessionData>(req, res, sessionOptions)

  console.log('API /user - Session:', session)

  if (session.user) {
    console.log('API /user - Utilisateur authentifié:', session.user)
    return NextResponse.json(session.user)
  } else {
    console.log('API /user - Utilisateur non authentifié')
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
}

