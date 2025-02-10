"use client"

import { ProjectProvider } from "@/contexts/ProjectContext"

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <ProjectProvider>{children}</ProjectProvider>
}

