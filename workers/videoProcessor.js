import { Worker } from 'bullmq'

import { exec } from 'child_process'
import util from 'util'
import * as Redis from 'redis'

const redisConnection = new Redis()
const execPromise = util.promisify(exec)

const videoWorker = new Worker(
  'video-processing',
  async job => {
    const { filePath, userId, projectName } = job.data

    console.log(`Processing video: ${filePath} for user ${userId}`)

    try {
      // Exemple : Transcodage avec FFmpeg
      const outputPath = filePath.replace('.mp4', '_processed.mp4')
      await execPromise(`ffmpeg -i ${filePath} -preset slow -crf 23 ${outputPath}`)

      console.log(`Video processed: ${outputPath}`)
    } catch (error) {
      console.error('Video processing failed:', error)
      throw error
    }
  },
  { connection: redisConnection }
)

console.log('Worker is running...')
