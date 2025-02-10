"use client"

import type React from "react"
import { createContext, useState, useContext, type ReactNode, useCallback } from "react"

interface Project {
  id: number
  projectName: string
}

interface ProjectContextType {
  projects: Project[]
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>
  refreshProjects: () => Promise<void>
  triggerRefresh: () => void
  triggerTasksRefresh: () => void
  triggerScenesRefresh: () => void
  scenesRefreshTrigger: number
  deleteProject: (projectId: number) => Promise<void>
  tasksRefreshTrigger: number
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export const useProjectContext = () => {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error("useProjectContext must be used within a ProjectProvider")
  }
  return context
}

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([])
  const [scenesRefreshTrigger, setScenesRefreshTrigger] = useState(0)
  const [tasksRefreshTrigger, setTasksRefreshTrigger] = useState(0)

  const refreshProjects = useCallback(async () => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 secondes timeout

      const response = await fetch("/api/projects", {
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        setProjects(data.projects)
      } else {
        console.error("Failed to fetch projects:", response.status, response.statusText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.error("Request to fetch projects timed out")
      } else {
        console.error("Error fetching projects:", error)
      }
    }
  }, [])

  const triggerRefresh = useCallback(() => {
    refreshProjects()
  }, [refreshProjects])

  const triggerTasksRefresh = useCallback(() => {
    setTasksRefreshTrigger((prev) => prev + 1)
  }, [])

  const triggerScenesRefresh = useCallback(() => {
    setScenesRefreshTrigger((prev) => prev + 1)
  }, [])

  const deleteProject = useCallback(
    async (projectId: number) => {
      try {
        const response = await fetch(`/api/projects/${projectId}`, {
          method: "DELETE",
        })

        if (response.ok) {
          // Remove the project from the local state
          setProjects((prevProjects) => prevProjects.filter((project) => project.id !== projectId))

          // Trigger a refresh of tasks and scenes
          triggerTasksRefresh()
          triggerScenesRefresh()
        } else {
          console.error("Failed to delete project:", response.status, response.statusText)
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      } catch (error) {
        console.error("Error deleting project:", error)
        throw error
      }
    },
    [triggerTasksRefresh, triggerScenesRefresh],
  )

  return (
    <ProjectContext.Provider
      value={{
        projects,
        setProjects,
        refreshProjects,
        triggerRefresh,
        triggerTasksRefresh,
        triggerScenesRefresh,
        scenesRefreshTrigger,
        deleteProject,
        tasksRefreshTrigger,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

