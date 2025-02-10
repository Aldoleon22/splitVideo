import type { NextRequest } from "next/server"
import videoQueue from "@/lib/queue"
import type { Job } from "bull"

export async function GET(request: NextRequest) {
  const jobId = request.nextUrl.pathname.split("/").pop()

  if (!jobId) {
    return Response.json({ error: "Job ID is missing" }, { status: 400 })
  }

  try {
    const job: Job<unknown> | null = await videoQueue.getJob(Number.parseInt(jobId))
    if (job) {
      const state = await job.getState()
      const isCompleted = state === "completed"
      const result = job.returnvalue
      return Response.json({ jobId, state, result: isCompleted ? result : null })
    } else {
      return Response.json({ error: "Job not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error checking job status:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

