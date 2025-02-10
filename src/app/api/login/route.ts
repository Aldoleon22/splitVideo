import { NextRequest, NextResponse } from 'next/server'
import * as bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { sessionOptions } from '@/lib/session'
import { getIronSession } from 'iron-session'
import type { SessionData } from '@/lib/session'

export async function POST(req: NextRequest) {
  const res = NextResponse.next()
  const session = await getIronSession<SessionData>(req, res, sessionOptions)

  try {
    const { email, password } = await req.json()

    console.log('API /login - Tentative de connexion pour:', email)

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      console.log('API /login - Utilisateur non trouvé:', email)
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      console.log('API /login - Mot de passe incorrect pour:', email)
      return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 })
    }

    if (!user.isVerified) {
      console.log('API /login - Compte non activé pour:', email)
      return NextResponse.json({ error: 'Compte non activé. Veuillez vérifier votre e-mail pour activer votre compte.' }, { status: 403 })
    }

    // Set the user in the session
    session.user = {
      id: user.id,
      email: user.email,
      isVerified: user.isVerified,
    }
    await session.save()

    console.log('API /login - Session après connexion:', session)

    const response = NextResponse.json({ message: 'Connexion réussie' }, { status: 200 })
    
    // Set the session cookie
    await session.save()

    console.log('API /login - Connexion réussie pour:', email)
    return response
  } catch (error) {
    console.error('API /login - Erreur lors de la connexion:', error)
    return NextResponse.json({ error: 'Une erreur est survenue lors de la connexion' }, { status: 500 })
  }
}

