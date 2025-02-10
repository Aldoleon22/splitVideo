'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader } from "@/components/ui/loader"
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { encryptId } from '@/utils/cryptoUtils'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useProjectContext } from '@/contexts/ProjectContext'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [resolution, setResolution] = useState('original')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { refreshProjects } = useProjectContext()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8" />
      </div>
    )
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0])
    }
  }

  const handleImport = async () => {
    if (!projectName.trim()) {
      setError("Le nom du projet est obligatoire.")
      return
    }

    if (!selectedFile) {
      setError("Veuillez sélectionner un fichier à importer.")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Check if project exists
      const checkResponse = await fetch(`/api/check-project?projectName=${encodeURIComponent(projectName)}&userId=${encryptId(parseInt(session.user.id))}`)
      const checkResult = await checkResponse.json()

      if (checkResult.exists) {
        setShowConfirmDialog(true)
        setIsLoading(false)
        return
      }

      await uploadAndProcess()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur inconnue est survenue')
      setIsLoading(false)
    }
  }

  const uploadAndProcess = async () => {
    const formData = new FormData()
    formData.append('file', selectedFile as File)
    formData.append('projectName', projectName)
    formData.append('resolution', resolution)
    formData.append('userId', encryptId(parseInt(session.user.id)))

    try {
      // First, upload the file
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('Erreur lors du téléchargement du fichier')
      }

      // Then, add to processing queue
      const processResponse = await fetch('/api/process-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          projectName, 
          resolution,
          userId: encryptId(parseInt(session.user.id))
        }),
      })

      const result = await processResponse.json()

      if (processResponse.ok) {
        setSuccess(`La vidéo a été ajoutée à la file d'attente pour traitement. ID de la tâche : ${result.queueId}`)
        await refreshProjects()  // Refresh the projects list
      } else {
        throw new Error(result.message || 'Une erreur est survenue lors de l\'ajout à la file d\'attente')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur inconnue est survenue')
    } finally {
      setIsLoading(false)
      setShowConfirmDialog(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Header />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="projectName" className="block text-sm font-medium">
                  Nom du projet <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Nom du projet"
                  className="bg-gray-700 border-gray-600"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="block text-sm font-medium">
                  Choisissez le fichier <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    readOnly
                    value={selectedFile ? selectedFile.name : ''}
                    placeholder="Aucun fichier sélectionné"
                    className="bg-gray-700 border-gray-600 flex-1"
                    onClick={() => fileInputRef.current?.click()}
                  />
                  <Input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".mp4,.avi,.mkv,.mov,.flv"
                  />
                  <Button 
                    variant="secondary" 
                    className="bg-gray-700 hover:bg-gray-600"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Parcourir
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="block text-sm font-medium">
                  Résolution :
                </Label>
                <Select defaultValue="original" onValueChange={(value) => setResolution(value)}>
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Sélectionnez la résolution" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="original">Format original</SelectItem>
                    <SelectItem value="1280x720">1280 x 720 (HD)</SelectItem>
                    <SelectItem value="1920x1080">1920 x 1080 (Full HD) - peut prendre du temps</SelectItem>
                    <SelectItem value="640x360">640 x 360 (SD)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                onClick={handleImport}
                disabled={isLoading}
              >
                {isLoading ? <Loader className="mr-2 h-4 w-4" /> : null}
                Importer
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert variant="default" className="bg-green-100 border-green-400 text-green-700">
                <AlertTitle>Succès</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
          </div>
        </main>
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer l'écrasement du projet</DialogTitle>
            <DialogDescription>
              Un projet avec le nom "{projectName}" existe déjà. Voulez-vous l'écraser ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Annuler</Button>
            <Button onClick={uploadAndProcess}>Confirmer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

