import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/auth?error=Token manquant', request.url))
  }

  try {
    const user = await prisma.user.findUnique({
      where: { activationToken: token }
    })

    if (!user) {
      return NextResponse.redirect(new URL('/auth?error=Token d\'activation invalide ou expiré', request.url))
    }

    if (user.isVerified) {
      return NextResponse.redirect(new URL('/auth?info=Ce compte est déjà activé', request.url))
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { 
        isVerified: true,
        activationToken: null
      }
    })

    return NextResponse.redirect(new URL('/auth?success=Compte activé avec succès', request.url))
  } catch (error) {
    console.error('Erreur lors de l\'activation du compte:', error)
    return NextResponse.redirect(new URL('/auth?error=Erreur lors de l\'activation du compte', request.url))
  }
}

