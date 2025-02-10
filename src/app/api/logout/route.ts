import { NextResponse } from 'next/server'
import { sessionOptions } from '@/lib/session'
import { getIronSession } from 'iron-session'
import type { SessionData } from '@/lib/session'

export async function POST(req: Request) {
  const res = NextResponse.next()
  const session = await getIronSession<SessionData>(req, res, sessionOptions)
  session.destroy()
  return NextResponse.json({ message: 'Déconnexion réussie' })
}

