import { NextRequest, NextResponse } from 'next/server'
import { decryptId } from '@/utils/cryptoUtils'
import prisma from '@/lib/prisma'
import videoQueue from '@/lib/queue'

export async function POST(request: NextRequest) {
  console.log('Ajout à la file d\'attente de traitement vidéo')
  const { projectName, resolution, userId } = await request.json()
  console.log(`Données reçues: projectName=${projectName}, resolution=${resolution}, userId=${userId}`)

  if (!projectName || !userId) {
    console.log('Erreur: projectName ou userId manquant')
    return NextResponse.json({ success: false, message: 'Project name and User ID are required' }, { status: 400 })
  }

  try {
    const decryptedUserId = decryptId(userId)
    
    // Créer une entrée dans la base de données
    const queueItem = await prisma.videoProcessingQueue.create({
      data: {
        userId: decryptedUserId,
        projectName,
        resolution,
        status: 'en attente',
        priority: 0
      }
    })

    // Ajouter la tâche à la file d'attente Bull avec l'ID de l'entrée de la base de données
    const job = await videoQueue.add({
      userId,
      projectName,
      resolution,
      queueItemId: queueItem.id  // Nous utilisons toujours queueItemId, mais il fait maintenant référence à l'ID de la base de données
    }, {
      priority: 0,
      attempts: 3
    })

    console.log(`Tâche ajoutée à la file d'attente avec l'ID: ${job.id}, queueItemId: ${queueItem.id}`)
    return NextResponse.json({ 
      success: true, 
      message: "La vidéo a été ajoutée à la file d'attente pour traitement.",
      queueId: queueItem.id,  // Ceci est maintenant l'ID de la base de données
      jobId: job.id
    })
  } catch (error) {
    console.error('Erreur lors de l\'ajout à la file d\'attente:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Une erreur est survenue lors de l\'ajout à la file d\'attente', 
      error: String(error) 
    }, { status: 500 })
  }
}

