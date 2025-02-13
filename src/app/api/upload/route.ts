import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { Queue } from 'bullmq'
import Redis from 'ioredis'

const redisConnection = new Redis() // Connexion Redis
const videoQueue = new Queue('video-processing', { connection: redisConnection })

export async function POST(request: NextRequest) {
  console.log('Starting file upload process')
  const data = await request.formData()
  const file: File | null = data.get('file') as unknown as File
  const projectName = data.get('projectName')
  const userId = data.get('userId')

  if (!file || !projectName || !userId) {
    return NextResponse.json({ success: false, message: 'Missing parameters' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const baseDir = path.join(process.cwd(), 'projets')
  const uploadDir = path.join(baseDir, userId as string, 'uploaded_videos', projectName as string)

  try {
    await mkdir(uploadDir, { recursive: true })
    const filePath = path.join(uploadDir, file.name)
    await writeFile(filePath, buffer)

    console.log(`File saved: ${filePath}`)

    // Ajouter la vidéo à la file d’attente
    await videoQueue.add('process-video', { filePath, userId, projectName })

    return NextResponse.json({ success: true, message: 'File uploaded and queued for processing' })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ success: false, message: 'Error saving the file' }, { status: 500 })
  }
}
