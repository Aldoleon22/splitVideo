import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  console.log('Starting file upload process')
  const data = await request.formData()
  const file: File | null = data.get('file') as unknown as File
  const projectName = data.get('projectName')
  const userId = data.get('userId')

  console.log(`Received data: projectName=${projectName}, userId=${userId}`)

  if (!file) {
    console.error('No file uploaded')
    return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 })
  }

  if (!projectName) {
    console.error('Project name is missing')
    return NextResponse.json({ success: false, message: 'Project name is required' }, { status: 400 })
  }

  if (!userId) {
    console.error('User ID is missing')
    return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const baseDir = path.join(process.cwd(), 'projets')
  const uploadDir = path.join(baseDir, userId as string, 'uploaded_videos', projectName as string)

  console.log(`Attempting to create directory: ${uploadDir}`)

  try {
    await mkdir(uploadDir, { recursive: true })
    console.log(`Directory created successfully: ${uploadDir}`)

    const filePath = path.join(uploadDir, file.name)
    await writeFile(filePath, buffer)
    console.log(`File written successfully: ${filePath}`)

    return NextResponse.json({ success: true, message: 'File uploaded successfully' })
  } catch (error) {
    console.error('Error during file upload:', error)
    return NextResponse.json({ success: false, message: 'Error saving the file', error: String(error) }, { status: 500 })
  }
}

