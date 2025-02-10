import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    console.log('User ID:', session.user.id);

    const projects = await prisma.videoProcessingQueue.findMany({
      where: {
        userId: parseInt(session.user.id)
      },
      select: {
        id: true,
        projectName: true
      },
      distinct: ['projectName'],
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('Projects found:', projects.length);

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Erreur lors de la récupération des projets:', error)
    return NextResponse.json({ error: 'Une erreur est survenue lors de la récupération des projets: ' + (error instanceof Error ? error.message : String(error)) }, { status: 500 })
  }
}

