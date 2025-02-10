import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import path from 'path'
import fs from 'fs/promises'
import { decryptId } from '@/utils/cryptoUtils'
import { getVideoMetadata } from '@/lib/videoUtils'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const projectId = decryptId(request.nextUrl.pathname.split("/").pop())

    console.log('Received request for project ID:', projectId);

    // Fetch project details from VideoProcessingQueue
    const project = await prisma.videoProcessingQueue.findUnique({
      where: { id: projectId }
    })

    if (!project) {
      console.log('Project not found for ID:', projectId);
      return NextResponse.json({ error: 'Projet non trouvé' }, { status: 404 })
    }

    console.log('Project found:', project);

    // Verify that the project belongs to the authenticated user
    if (project.userId !== parseInt(session.user.id)) {
      console.log('User not authorized. Project user ID:', project.userId, 'Session user ID:', session.user.id);
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const userId = project.userId.toString()
    const baseDir = path.join(process.cwd(), 'projets')
    const userDirs = await fs.readdir(baseDir)
    let encryptedUserId = ''

    for (const dir of userDirs) {
      let dossier = decryptId(dir)
      if ( dossier.toString() == userId) {
        encryptedUserId = dir
        break
      }
    }

    if (!encryptedUserId) {
      console.error('User directory not found');
      return NextResponse.json({ error: 'Dossier utilisateur non trouvé' }, { status: 404 })
    }

    const scenesPath = path.join(baseDir, encryptedUserId, 'processed_videos', project.projectName)

    console.log('Scenes path:', scenesPath);

    try {
      await fs.access(scenesPath)
    } catch (error) {
      console.error('Error accessing scenes path:', error);
      return NextResponse.json({ error: 'Dossier du projet non trouvé', scenes: [] }, { status: 404 })
    }

    const files = await fs.readdir(scenesPath)
    const videoFiles = files.filter(file => 
      file.toLowerCase().endsWith('.mp4') || 
      file.toLowerCase().endsWith('.avi') || 
      file.toLowerCase().endsWith('.mkv')
    )

    console.log('Video files found:', videoFiles);

    const scenes = await Promise.all(videoFiles.map(async (fileName) => {
      const filePath = path.join(scenesPath, fileName)
      const stats = await fs.stat(filePath)
      const metadata = await getVideoMetadata(filePath)

      return {
        id: fileName,
        fileName,
        duration: metadata.duration || 'N/A',
        codec: metadata.codec || 'N/A',
        resolution: metadata.resolution || 'N/A',
        bitrate: metadata.bitrate || 'N/A',
        size: (stats.size / (1024 * 1024)).toFixed(2) + ' MB',
        path: filePath
      }
    }))

    console.log('Scenes data:', scenes);

    return NextResponse.json({ scenes, projectName: project.projectName })
  } catch (error) {
    console.error('Error fetching scenes:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des scènes: ' + (error as Error).message }, { status: 500 })
  }
}

