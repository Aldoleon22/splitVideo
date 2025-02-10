"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Loader } from "@/components/ui/loader"
import { Header } from "@/components/Header"
import { Sidebar } from "@/components/Sidebar"
import { TaskList } from "./TaskList"
import { useProjectContext } from "@/contexts/ProjectContext"

interface Task {
  id: number
  projectName: string
  resolution: string
  status: string
  createdAt: string
  userId: number
  updatedAt: string
}

export default function TasksPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const { tasksRefreshTrigger } = useProjectContext()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth")
    } else if (status === "authenticated") {
      fetchTasks()
      const interval = setInterval(fetchTasks, 5000) // Rafraîchir toutes les 5 secondes
      return () => clearInterval(interval)
    }
  }, [status, tasksRefreshTrigger])

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks")
      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks)
      } else {
        console.error("Erreur lors de la récupération des tâches")
      }
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteTask = async (taskId: number) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de la tâche")
      }
      // Mettre à jour l'état local après une suppression réussie
      setTasks(tasks.filter((task) => task.id !== taskId))
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
      throw error
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-4">Tâches en cours</h1>
          <TaskList tasks={tasks} onDeleteTask={deleteTask} />
        </main>
      </div>
    </div>
  )
}

