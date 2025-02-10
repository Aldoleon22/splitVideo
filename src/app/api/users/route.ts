import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import * as bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

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

    // Création de l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        isVerified: false,
      },
    })

    // Simuler l'envoi d'un e-mail de confirmation
    console.log(`Envoi d'un e-mail de confirmation à ${email} avec le lien d'activation : http://localhost:3000/auth?activate=${email}`)

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

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
        isVerified: true,
      },
    })
    return NextResponse.json({ users })
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error)
    return NextResponse.json({ error: 'Une erreur est survenue lors de la récupération des utilisateurs.' }, { status: 500 })
  }
}

