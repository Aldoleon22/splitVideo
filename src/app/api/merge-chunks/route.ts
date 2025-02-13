import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(req: NextRequest) {
  const { fileId, projectName, resolution, userId } = await req.json()

  if (!fileId || !projectName || !resolution || !userId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const uploadsDir = path.join(process.cwd(), "uploads", userId, fileId)
  const outputDir = path.join(process.cwd(), "projets", userId, 'uploaded_videos',projectName)
  fs.mkdirSync(outputDir, { recursive: true })

  const outputFile = path.join(outputDir, `${fileId}.mp4`)
  const writeStream = fs.createWriteStream(outputFile)

  try {
    const files = fs.readdirSync(uploadsDir).sort((a, b) => {
      return Number.parseInt(a.split("-")[1]) - Number.parseInt(b.split("-")[1])
    })

    for (const file of files) {
      const chunkPath = path.join(uploadsDir, file)
      const chunkContent = fs.readFileSync(chunkPath)
      writeStream.write(chunkContent)
      fs.unlinkSync(chunkPath)
    }

    writeStream.end()

    fs.rmdirSync(uploadsDir)

    // Here you would typically process the video (e.g., change resolution)
    // For now, we'll just simulate this step
    console.log(`Processing video: ${outputFile} with resolution: ${resolution}`)

    return NextResponse.json({ message: "File merged successfully" })
  } catch (error) {
    console.error("Error merging chunks:", error)
    return NextResponse.json({ error: "Failed to merge chunks" }, { status: 500 })
  }
}

