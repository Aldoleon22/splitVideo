import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs/promises'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const projectName = searchParams.get('projectName')
  const userId = searchParams.get('userId')

  console.log('Received request for check-project');
  console.log('Search params:', Object.fromEntries(searchParams));
  console.log('Project Name:', projectName);
  console.log('User ID:', userId);

  if (!projectName || !userId) {
    console.log('Missing required parameters');
    return NextResponse.json({ error: 'Project name and User ID are required' }, { status: 400 });
  }

  const baseDir = path.join(process.cwd(), 'projets')
  const projectDir = path.join(baseDir, userId, 'uploaded_videos', projectName)

  console.log('Checking directory:', projectDir);

  try {
    await fs.access(projectDir)
    console.log('Project directory exists');
    return NextResponse.json({ exists: true })
  } catch (error) {
    console.log('Project directory does not exist');
    return NextResponse.json({ exists: false })
  }
}

