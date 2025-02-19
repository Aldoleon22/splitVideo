import { NextResponse } from "next/server"
import Redis from "ioredis"

let redis: Redis | null = null

async function getRedisClient() {
  if (!redis) {
    if (!process.env.REDIS_URL) {
      throw new Error("REDIS_URL is not defined")
    }
    redis = new Redis(process.env.REDIS_URL, {
      retryStrategy: (times) => {
        if (times > 3) {
          throw new Error(`Could not connect to Redis after ${times} attempts`)
        }
        return Math.min(times * 100, 3000)
      },
    })
    redis.on("error", (err) => {
      console.error("Redis error:", err)
      redis = null
    })
  }
  return redis
}

export async function GET() {
  console.log("🔍 GET request received")

  try {
    const client = await getRedisClient()
    console.log("✅ Redis connection established")

    const videos = await client.lrange("processed-videos", 0, -1)
    console.log("🎥 Videos retrieved:", videos)

    return NextResponse.json(
      { videos },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      },
    )
  } catch (error) {
    console.error("❌ Error:", error)
    return NextResponse.json(
      { error: "Server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    },
  )
}

