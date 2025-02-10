import { NextRequest, NextResponse } from 'next/server'
import * as bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { sendEmail } from '@/lib/emailUtils'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validation basique
    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis', status: false }, { status: 400 })
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé', status: false }, { status: 400 })
    }

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10)

    //Générer un token d'activation
    const activationToken = crypto.randomBytes(32).toString('hex')
    console.log('tokenActivation',activationToken)
    // Création de l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        isVerified: false,
        activationToken
      },
    })

      // Envoyer l'e-mail d'activation
      const activationLink = `${process.env.NEXT_PUBLIC_APP_URL}/api/activate-account?token=${activationToken}`
      await sendEmail(
        email,
        "Activez votre compte Split Video",
        `
        <h1>Bienvenue sur Split Video !</h1>
        <p>Cliquez sur le lien ci-dessous pour activer votre compte :</p>
        <a href="${activationLink}">Activer mon compte</a>
        `
      )

    return NextResponse.json({ 
      message: "Inscription réussie. Veuillez vérifier votre e-mail pour activer votre compte.",
      user: { id: user.id, email: user.email },
      status: true 
    }, { status: 201 })
    
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error)
    return NextResponse.json({ error: 'Une erreur est survenue lors de la création de l\'utilisateur.', status: false }, { status: 500 })
  }
}

