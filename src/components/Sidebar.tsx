"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { encryptId } from "@/utils/cryptoUtils"
import { Loader } from "@/components/ui/loader"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useProjectContext } from "@/contexts/ProjectContext"
import { motion } from "framer-motion"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function Sidebar() {
  const { data: session, status } = useSession()
  const { projects, refreshProjects, triggerTasksRefresh } = useProjectContext()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const projectsPerPage = 10
  const [direction, setDirection] = useState(1)
  const [isScrolling, setIsScrolling] = useState(false)
  const [hoveredProjectId, setHoveredProjectId] = useState<number | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null)
  const [isDeletingProject, setIsDeletingProject] = useState(false)

  const scrollThreshold = 100

  useEffect(() => {
    if (status === "authenticated") {
      const fetchProjects = async () => {
        setIsLoading(true)
        try {
          await refreshProjects()
        } catch (error) {
          console.error("Error fetching projects:", error)
          setError("Échec du chargement des projets")
        } finally {
          setIsLoading(false)
        }
      }
      fetchProjects()
    }
  }, [status, refreshProjects])

  const totalPages = Math.ceil(projects.length / projectsPerPage)
  const indexOfLastProject = currentPage * projectsPerPage
  const indexOfFirstProject = indexOfLastProject - projectsPerPage
  const currentProjects = projects.slice(indexOfFirstProject, indexOfLastProject)

  useEffect(() => {
    const handleScroll = (event) => {
      if (isScrolling) return

      const scrollDistance = event.deltaY

      if (Math.abs(scrollDistance) > scrollThreshold) {
        setIsScrolling(true)

        if (scrollDistance > 0 && currentPage < totalPages) {
          setDirection(1)
          setCurrentPage((prev) => prev + 1)
        } else if (scrollDistance < 0 && currentPage > 1) {
          setDirection(-1)
          setCurrentPage((prev) => prev - 1)
        }

        setTimeout(() => {
          setIsScrolling(false)
        }, 500)
      }
    }

    window.addEventListener("wheel", handleScroll)
    return () => window.removeEventListener("wheel", handleScroll)
  }, [currentPage, totalPages, isScrolling])

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
      triggerTasksRefresh()
      setIsDeleteDialogOpen(false)
      setProjectToDelete(null)
    } catch (err) {
      console.error("Error deleting project:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsDeletingProject(false)
    }
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
          <ScrollArea className="h-[calc(100vh-180px)] overflow-hidden">
  <motion.div
    key={currentPage}
    initial={{ opacity: 0, y: direction * 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -direction * 20 }}
    transition={{ duration: 0.3 }}
  >
    {currentProjects.map((project) => (
      <div
        key={project.id}
        className="group transition-opacity duration-300 relative p-2 rounded text-gray-300 hover:bg-gray-700"
        onMouseEnter={() => setHoveredProjectId(project.id)} // Show delete button on hover
        onMouseLeave={() => setHoveredProjectId(null)} // Hide delete button when not hovering
      >
        <Link
          href={`/projet/${encryptId(project.id)}`}
          className="flex items-center justify-between w-full"
        >
          <span className="text-sm truncate">{project.projectName}</span>
        </Link>

        {hoveredProjectId === project.id && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-0 right-2 opacity-100 bg-yellow-600 hover:bg-yellow-700 text-white"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              deleteProject(project.id)
            }}
          >
            Supprimer
          </Button>
        )}
      </div>
    ))}
  </motion.div>
</ScrollArea>

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
