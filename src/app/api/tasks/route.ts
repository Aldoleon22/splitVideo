import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const tasks = await prisma.videoProcessingQueue.findMany({
      where: {
        userId: parseInt(session.user.id)
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        projectName: true,
        resolution: true,
        status: true,
        createdAt: true
      }
    })

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('Erreur lors de la récupération des tâches:', error)
    return NextResponse.json({ error: 'Une erreur est survenue lors de la récupération des tâches' }, { status: 500 })
  }
}

