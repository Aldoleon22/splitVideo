"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { encryptId } from "@/utils/cryptoUtils"
import { Loader } from "@/components/ui/loader"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useProjectContext } from "@/contexts/ProjectContext"
import { motion } from "framer-motion"

export function Sidebar() {
  const { data: session, status } = useSession()
  const { projects, refreshProjects } = useProjectContext()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const projectsPerPage = 10
  const [direction, setDirection] = useState(1)
  const [isScrolling, setIsScrolling] = useState(false) // Pour éviter un changement trop rapide de page
  const scrollThreshold = 100 // Seuil de distance pour activer le changement de page

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
      if (isScrolling) return // Évite de changer de page si un changement est déjà en cours

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

        // Remettre le flag après un délai pour éviter un changement rapide
        setTimeout(() => {
          setIsScrolling(false)
        }, 500) // Attendre 500ms avant de pouvoir changer de page à nouveau
      }
    }

    window.addEventListener("wheel", handleScroll)
    return () => window.removeEventListener("wheel", handleScroll)
  }, [currentPage, totalPages, isScrolling])

  return (
    <aside className="w-64 bg-gray-800 min-h-screen p-4 flex flex-col">
      <div className="space-y-2 flex-grow">
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
                <div key={project.id} className="group transition-opacity duration-300">
                  <Link
                    href={`/projet/${encryptId(project.id)}`}
                    className="flex items-center justify-between p-2 rounded text-gray-300 hover:bg-gray-700"
                  >
                    <span className="text-sm truncate">{project.projectName}</span>
                  </Link>
                </div>
              ))}
            </motion.div>
          </ScrollArea>
        )}
      </div>
    </aside>
  )
  //ok build
}
