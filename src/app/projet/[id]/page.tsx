"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download } from "lucide-react"
import { Loader } from "@/components/ui/loader"
import { Sidebar } from "@/components/Sidebar"
import { Header } from "@/components/Header"
import { useProjectContext } from "@/contexts/ProjectContext"

interface Scene {
  id: string
  fileName: string
  duration: string
  codec: string
  resolution: string
  bitrate: string
  size: string
}

export default function ProjectPage() {
  const params = useParams()
  const id = params?.id as string
  const { data: session, status } = useSession()
  const router = useRouter()
  const [scenes, setScenes] = useState<Scene[]>([])
  const [loading, setLoading] = useState(true)
  const [projectName, setProjectName] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const { scenesRefreshTrigger } = useProjectContext()

  useEffect(() => {
    const fetchScenes = async () => {
      if (!id) {
        setError("ID de projet manquant")
        setLoading(false)
        return
      }

      try {
        console.log("Fetching scenes for project ID:", id)
        const response = await fetch(`/api/scenes/${id}`)

        if (!response.ok) {
          const errorText = await response.text()
          console.error("Error response:", response.status, errorText)
          throw new Error(`Erreur lors de la récupération des scènes: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        console.log("Received data:", data)
        setScenes(data.scenes)
        setProjectName(data.projectName)
      } catch (error) {
        console.error("Error:", error)
        setError(
          `Erreur lors de la récupération des données: ${error instanceof Error ? error.message : String(error)}`,
        )
        if (error instanceof Error && error.message.includes("Non autorisé")) {
          router.push("/")
        }
      } finally {
        setLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchScenes()
    }
  }, [id, status, router, scenesRefreshTrigger])

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8" />
      </div>
    )
  }

  if (!session) {
    router.push("/auth")
    return null
  }

  const downloadScene = (fileName: string) => {
    const url = `/api/scenes/${id}/download?fileName=${encodeURIComponent(fileName)}`
    window.location.href = url
  }

  const downloadAllScenes = () => {
    const url = `/api/scenes/${id}/download?downloadAll=true`
    window.location.href = url
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Header />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-6">
          {error ? (
            <div className="text-red-500 text-center">
              <p className="font-bold">Erreur :</p>
              <p>{error}</p>
            </div>
          ) : scenes.length === 0 ? (
            <p className="text-center text-xl">Aucune scène disponible pour ce projet</p>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Scènes du projet : {projectName}</h2>
                <Button onClick={downloadAllScenes} className="bg-yellow-500 hover:bg-yellow-600 text-black">
                  <Download className="mr-2 h-4 w-4" /> Télécharger toutes les scènes
                </Button>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Nom du fichier</TableHead>
                      <TableHead className="whitespace-nowrap">Durée</TableHead>
                      <TableHead className="whitespace-nowrap">Codec</TableHead>
                      <TableHead className="whitespace-nowrap">Résolution</TableHead>
                      <TableHead className="whitespace-nowrap">Bitrate</TableHead>
                      <TableHead className="whitespace-nowrap">Taille</TableHead>
                      <TableHead className="whitespace-nowrap">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scenes.map((scene) => (
                      <TableRow key={scene.id}>
                        <TableCell>{scene.fileName}</TableCell>
                        <TableCell>{scene.duration}</TableCell>
                        <TableCell>{scene.codec}</TableCell>
                        <TableCell>{scene.resolution}</TableCell>
                        <TableCell>{scene.bitrate}</TableCell>
                        <TableCell>{scene.size}</TableCell>
                        <TableCell>
                          <Button
                            onClick={() => downloadScene(scene.fileName)}
                            variant="outline"
                            size="sm"
                            className="bg-gray-700 hover:bg-gray-600"
                          >
                            <Download className="mr-2 h-4 w-4" /> Télécharger
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

