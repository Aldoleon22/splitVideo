import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import path from "path"
import fs from "fs/promises"
import { createReadStream } from "fs"
import { decryptId } from "@/utils/cryptoUtils"
import archiver from "archiver"
import { Readable } from "stream"
import prisma from "@/lib/prisma"

// Fonction pour obtenir le chemin de base des projets
function getBaseProjectPath() {
  if (process.env.NODE_ENV === "production") {
    return path.join("/var/www/vhosts/yopyo.com/split-video-pro.yopyo.com", "projets")
  }
  return path.join(process.cwd(), "projets")
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    // Extraction de l'ID du projet à partir de l'URL
    const urlParts = request.nextUrl.pathname.split("/")
    const encryptedProjectId = urlParts[urlParts.length - 2] // L'avant-dernier segment de l'URL
    console.log("Encrypted ProjectId:", encryptedProjectId)

    let projectId
    try {
      projectId = decryptId(encryptedProjectId)
      console.log("Decrypted ProjectId:", projectId)
    } catch (decryptError) {
      console.error("Decryption error:", decryptError)
      return NextResponse.json({ error: "ID de projet invalide", details: decryptError.message }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get("fileName")
    const downloadAll = searchParams.get("downloadAll") === "true"

    console.log("ProjectId:", projectId)
    console.log("FileName:", fileName)
    console.log("DownloadAll:", downloadAll)
    console.log("Environment:", process.env.NODE_ENV)
    console.log("Base project path:", getBaseProjectPath())

    // Fetch project details from VideoProcessingQueue
    const project = await prisma.videoProcessingQueue.findUnique({
      where: { id: Number.parseInt(projectId) },
    })

    if (!project) {
      console.error("Project not found:", projectId)
      return NextResponse.json({ error: "Projet non trouvé" }, { status: 404 })
    }

    console.log("Project:", project)

    // Verify that the project belongs to the authenticated user
    if (project.userId !== Number.parseInt(session.user.id)) {
      console.error("Unauthorized access:", session.user.id, "trying to access project of user", project.userId)
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const baseDir = getBaseProjectPath()
    console.log("BaseDir:", baseDir)

    try {
      await fs.access(baseDir)
    } catch (error) {
      console.error("Base directory not accessible:", baseDir, error)
      return NextResponse.json(
        {
          error: "Dossier de base non accessible",
          path: baseDir,
        },
        { status: 404 },
      )
    }

    const userDirs = await fs.readdir(baseDir)
    console.log("UserDirs:", userDirs)

    let encryptedUserId = ""

    for (const dir of userDirs) {
      try {
        const dossier = decryptId(dir)
        if (dossier.toString() === project.userId.toString()) {
          encryptedUserId = dir
          break
        }
      } catch (error) {
        console.error("Error decrypting directory:", dir, error)
        // Continue to the next directory
      }
    }

    if (!encryptedUserId) {
      console.error("User directory not found for user:", project.userId)
      return NextResponse.json({ error: "Dossier utilisateur non trouvé" }, { status: 404 })
    }

    console.log("EncryptedUserId:", encryptedUserId)

    const projectPath = path.join(baseDir, encryptedUserId, "processed_videos", project.projectName)
    console.log("ProjectPath:", projectPath)

    try {
      await fs.access(projectPath)
    } catch (error) {
      console.error("Project directory not accessible:", projectPath, error)
      return NextResponse.json(
        {
          error: "Dossier du projet non accessible",
          path: projectPath,
        },
        { status: 404 },
      )
    }

    if (downloadAll) {
      const files = await fs.readdir(projectPath)
      console.log("Files in project directory:", files)

      const videoFiles = files.filter(
        (file) =>
          file.toLowerCase().endsWith(".mp4") ||
          file.toLowerCase().endsWith(".avi") ||
          file.toLowerCase().endsWith(".mkv"),
      )
      console.log("Video files:", videoFiles)

      if (videoFiles.length === 0) {
        return NextResponse.json(
          {
            error: "Aucun fichier vidéo trouvé",
            path: projectPath,
            files: files,
          },
          { status: 404 },
        )
      }

      const archive = archiver("zip", { zlib: { level: 9 } })

      const readable = new Readable().wrap(archive)
      const stream = new ReadableStream({
        start(controller) {
          readable.on("data", (chunk) => controller.enqueue(chunk))
          readable.on("end", () => controller.close())
          readable.on("error", (err) => controller.error(err))
        },
      })

      for (const file of videoFiles) {
        const filePath = path.join(projectPath, file)
        console.log("Adding file to archive:", filePath)
        archive.append(createReadStream(filePath), { name: file })
      }

      archive.finalize()

      const response = new NextResponse(stream)
      response.headers.set("Content-Type", "application/zip")
      response.headers.set("Content-Disposition", `attachment; filename="${project.projectName}-scenes.zip"`)

      return response
    } else if (fileName) {
      const filePath = path.join(projectPath, fileName)
      console.log("Downloading single file:", filePath)

      try {
        await fs.access(filePath)
      } catch (error) {
        console.error("File not accessible:", filePath, error)
        return NextResponse.json(
          {
            error: "Fichier non accessible",
            path: filePath,
          },
          { status: 404 },
        )
      }

      const fileStream = createReadStream(filePath)

      const stream = new ReadableStream({
        start(controller) {
          fileStream.on("data", (chunk) => controller.enqueue(chunk))
          fileStream.on("end", () => controller.close())
          fileStream.on("error", (err) => controller.error(err))
        },
      })

      const response = new NextResponse(stream)
      response.headers.set("Content-Type", "video/mp4")
      response.headers.set("Content-Disposition", `attachment; filename="${fileName}"`)

      return response
    }

    return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 })
  } catch (error) {
    console.error("Error downloading scenes:", error)
    return NextResponse.json(
      {
        error: "Erreur lors du téléchargement",
        details: error.message,
        downloadUrl: request.url,
        baseDir: getBaseProjectPath(),
        userDirs: await fs.readdir(getBaseProjectPath()).catch(() => "Unable to read user directories"),
      },
      { status: 500 },
    )
  }
}

