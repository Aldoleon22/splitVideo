import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get("file") as File
  const fileId = formData.get("fileId") as string
  const chunkIndex = formData.get("chunkIndex") as string
  const totalChunks = formData.get("totalChunks") as string
  const projectName = formData.get("projectName") as string
  const resolution = formData.get("resolution") as string
  const userId = formData.get("userId") as string

  if (!file || !fileId || !chunkIndex || !totalChunks || !projectName || !resolution || !userId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const uploadsDir = path.join(process.cwd(), "uploads", userId, fileId)
  fs.mkdirSync(uploadsDir, { recursive: true })

  const buffer = Buffer.from(await file.arrayBuffer())
  const filePath = path.join(uploadsDir, `chunk-${chunkIndex}`)

  try {
    fs.writeFileSync(filePath, buffer)
    return NextResponse.json({ message: "Chunk uploaded successfully" })
  } catch (error) {
    console.error("Error writing file:", error)
    return NextResponse.json({ error: "Failed to write file" }, { status: 500 })
  }
}

