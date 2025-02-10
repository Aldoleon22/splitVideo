import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from '@/lib/prisma'
import { decryptId,encryptId } from '@/utils/cryptoUtils'
import fs from 'fs/promises'
import path from 'path'

export async function GET(
  request: NextRequest
) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    
    const projectId = decryptId(request.nextUrl.pathname.split("/").pop())

    const project = await prisma.videoProcessingQueue.findFirst({
      where: {
        id: projectId,
        userId: parseInt(session.user.id)
      },
      select: {
        projectName: true
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Projet non trouvé ou non autorisé' }, { status: 403 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.log('Erreur lors de la récupération du projet:', error)
    return NextResponse.json({ error: 'Une erreur est survenue lors de la récupération du projet' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest
) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const body = await request.json()
    console.log('Received body:', body)

    const { action, projectToDelete } = body

    if (action !== 'delete') {
      return NextResponse.json({ error: 'Action non valide' }, { status: 400 })
    }

    const projectId = decryptId(projectToDelete)

    const project = await prisma.videoProcessingQueue.findFirst({
      where: {
        id: projectId,
        userId: parseInt(session.user.id)
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Projet non trouvé ou non autorisé' }, { status: 403 })
    }
    const projectPath = path.join(process.cwd(), 'projets', encryptId(parseInt(session.user.id)))
    const processedVideosPath = path.join(projectPath, 'processed_videos', project.projectName)
    const uploadedVideosPath = path.join(projectPath, 'uploaded_videos', project.projectName)

    try {
      await fs.rm(processedVideosPath, { recursive: true, force: true })
      console.log('Dossier processed_videos supprimé avec succès')
    } catch (fileError) {
      console.log('Erreur lors de la suppression du dossier processed_videos:', fileError)
    }

    try {
      await fs.rm(uploadedVideosPath, { recursive: true, force: true })
      console.log('Dossier uploaded_videos supprimé avec succès')
    } catch (fileError) {
      console.log('Erreur lors de la suppression du dossier uploaded_videos:', fileError)
    }

    // Vérifier si le dossier du projet est vide et le supprimer si c'est le cas
    try {
      const files = await fs.readdir(projectPath)
      if (files.length === 0) {
        await fs.rmdir(projectPath)
        console.log('Dossier du projet supprimé car vide')
      } else {
        console.log('Le dossier du projet n\'est pas vide, il n\'a pas été supprimé')
      }
    } catch (error) {
      console.log('Erreur lors de la vérification ou suppression du dossier du projet:', error)
    }

    // Supprimer les tâches associées au projet
    const deletedProject = await prisma.videoProcessingQueue.deleteMany({
      where: {
        projectName: project.projectName,
        userId: parseInt(session.user.id)
      }
    })

   
    console.log('Résultat de la suppression:', deletedProject)

    return NextResponse.json({ 
      message: 'Projet et fichiers associés supprimés avec succès', 
      deletedProject 
    })

  } catch (error) {
    console.log('Erreur lors de la suppression du projet:', error)
    return NextResponse.json({ 
      error: 'Une erreur est survenue lors de la suppression du projet',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

