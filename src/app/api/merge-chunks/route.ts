import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(req: NextRequest) {
  const { fileId, projectName, resolution, userId, originalFileName } = await req.json()

  if (!fileId || !projectName || !resolution || !userId || !originalFileName) {
    console.error("Missing required fields:", { fileId, projectName, resolution, userId, originalFileName })
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const uploadsDir = path.join(process.cwd(), "uploads", userId, fileId)
  const outputDir = path.join(process.cwd(), "projets", userId, 'uploaded_videos', projectName)
  console.log(`Creating directory at ${outputDir}`)
  fs.mkdirSync(outputDir, { recursive: true })

  const outputFile = path.join(outputDir, originalFileName) // Utiliser le nom original
  const writeStream = fs.createWriteStream(outputFile)

  try {
    const files = fs.readdirSync(uploadsDir).sort((a, b) => {
      return Number.parseInt(a.split("-")[1]) - Number.parseInt(b.split("-")[1])
    })

    console.log(`Merging chunks from ${uploadsDir} into ${outputFile}`)

    for (const file of files) {
      const chunkPath = path.join(uploadsDir, file)
      console.log(`Writing chunk: ${chunkPath}`)
      const chunkContent = fs.readFileSync(chunkPath)
      writeStream.write(chunkContent)
      fs.unlinkSync(chunkPath)
    }

    writeStream.end()

    // Delete the directory after processing
    console.log(`Removing uploads directory: ${uploadsDir}`)
    fs.rmdirSync(uploadsDir)

    // Traitement de la vidéo (par exemple, modification de la résolution)
    console.log(`Processing video: ${outputFile} with resolution: ${resolution}`)

    return NextResponse.json({ message: "File merged successfully" })
  } catch (error) {
    console.error("Error merging chunks:", error)
    return NextResponse.json({ error: "Failed to merge chunks" }, { status: 500 })
  }
}
