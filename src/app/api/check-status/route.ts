import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import videoQueue from '@/lib/queue'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const queueId = searchParams.get('queueId')

  if (!queueId) {
    return NextResponse.json({ error: 'Queue ID is required' }, { status: 400 })
  }

  try {
    const task = await prisma.videoProcessingQueue.findUnique({
      where: { id: parseInt(queueId) }
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Vérifier le statut dans Bull
    const job = await videoQueue.getJob(task.id)
    let status = task.status

    if (job) {
      const jobState = await job.getState()
      if (jobState === 'completed') {
        status = 'completed'
      } else if (jobState === 'failed') {
        status = 'failed'
      } else if (jobState === 'active') {
        status = 'processing'
      }

      // Mettre à jour le statut dans la base de données si nécessaire
      if (status !== task.status) {
        await prisma.videoProcessingQueue.update({
          where: { id: task.id },
          data: { status }
        })
      }
    }

    return NextResponse.json({ status })
  } catch (error) {
    console.error('Error checking task status:', error)
    return NextResponse.json({ error: 'An error occurred while checking the task status' }, { status: 500 })
  }
}

