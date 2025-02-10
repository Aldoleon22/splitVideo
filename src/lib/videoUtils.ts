import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface VideoMetadata {
  duration: string;
  codec: string;
  resolution: string;
  bitrate: string;
}

export async function getVideoMetadata(filePath: string): Promise<VideoMetadata> {
  try {
    const { stdout } = await execAsync(`ffprobe -v quiet -print_format json -show_format -show_streams "${filePath}"`)
    const data = JSON.parse(stdout)
    const videoStream = data.streams.find((s: any) => s.codec_type === 'video')

    return {
      duration: formatDuration(parseFloat(data.format.duration || '0')),
      codec: videoStream?.codec_name || 'N/A',
      resolution: videoStream ? `${videoStream.width}x${videoStream.height}` : 'N/A',
      bitrate: formatBitrate(parseInt(data.format.bit_rate || '0')),
    }
  } catch (error) {
    console.error('Error getting video metadata:', error)
    return {
      duration: 'N/A',
      codec: 'N/A',
      resolution: 'N/A',
      bitrate: 'N/A',
    }
  }
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

function formatBitrate(bitrate: number): string {
  if (bitrate === 0) return 'N/A'
  return `${(bitrate / 1000000).toFixed(2)} Mbps`
}

