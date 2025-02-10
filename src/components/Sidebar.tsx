"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { encryptId } from "@/utils/cryptoUtils"
import { Loader } from "@/components/ui/loader"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useProjectContext } from "@/contexts/ProjectContext"

export function Sidebar() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { projects, refreshProjects, triggerTasksRefresh } = useProjectContext()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null)
  const [isDeletingProject, setIsDeletingProject] = useState(false)

  useEffect(() => {
    if (status === "authenticated") {
      const fetchProjects = async () => {
        setIsLoading(true)
        try {
          await refreshProjects()
        } catch (error) {
          console.error("Error fetching projects:", error)
          setError("Failed to load projects")
        } finally {
          setIsLoading(false)
        }
      }

      fetchProjects()
    }
  }, [status, refreshProjects])

  const deleteProject = async (id: number) => {
    setProjectToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (projectToDelete === null) return

    setIsDeletingProject(true)
    try {
      const response = await fetch(`/api/projects/${encryptId(projectToDelete)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "delete", projectToDelete: encryptId(projectToDelete) }),
      })

      let errorMessage = "Failed to delete project"
      if (!response.ok) {
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (jsonError) {
          console.error("Error parsing JSON:", jsonError)
          errorMessage = `${errorMessage}: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      await refreshProjects()
      triggerTasksRefresh() // Trigger a refresh of the tasks list
      setIsDeleteDialogOpen(false)
      setProjectToDelete(null)
    } catch (err) {
      console.error("Error deleting project:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsDeletingProject(false)
    }
  }

  const renderProjectItem = (project: { id: number; projectName: string }) => (
    <div key={project.id} className="group">
      <Link
        href={`/projet/${encryptId(project.id)}`}
        className="flex items-center justify-between p-2 rounded text-gray-300 hover:bg-gray-700"
      >
        <span className="text-sm truncate">{project.projectName}</span>
        <Button
          variant="ghost"
          size="sm"
          className="opacity-0 group-hover:opacity-100 bg-yellow-600 hover:bg-yellow-700 text-white"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            deleteProject(project.id)
          }}
        >
          Supprimer
        </Button>
      </Link>
    </div>
  )

  if (isLoading) {
    return (
      <aside className="w-64 bg-gray-800 min-h-screen p-4 flex justify-center items-center">
        <Loader className="w-8 h-8" />
      </aside>
    )
  }

  return (
    <aside className="w-64 bg-gray-800 min-h-screen p-4">
      <div className="space-y-2 h-full flex flex-col">
        <div className="text-sm text-gray-400 flex items-center">
          <span className="mr-2">📁</span> Projets
        </div>
        {error ? (
          <div className="text-sm text-red-500">{error}</div>
        ) : projects.length === 0 ? (
          <div className="text-sm text-gray-500">Aucun projet importé pour le moment</div>
        ) : (
          <ScrollArea className="flex-grow">{projects.map(renderProjectItem)}</ScrollArea>
        )}
      </div>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeletingProject}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeletingProject}>
              {isDeletingProject ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  )
}

