import { type NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ success: false, error: "URL is required" }, { status: 400 })
    }

    // Validate YouTube URL
    const youtubeRegex = /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)/
    if (!youtubeRegex.test(url)) {
      return NextResponse.json({ success: false, error: "Invalid YouTube URL" }, { status: 400 })
    }

    const scriptPath = path.join(process.cwd(), "scripts", "get_video_info.py")

    return new Promise((resolve) => {
      const python = spawn("python3", [scriptPath, url])
      let output = ""
      let error = ""

      python.stdout.on("data", (data) => {
        output += data.toString()
      })

      python.stderr.on("data", (data) => {
        error += data.toString()
      })

      python.on("close", (code) => {
        if (code !== 0) {
          resolve(NextResponse.json({ success: false, error: error || "Failed to get video info" }, { status: 500 }))
          return
        }

        try {
          const result = JSON.parse(output)
          resolve(NextResponse.json(result))
        } catch (parseError) {
          resolve(NextResponse.json({ success: false, error: "Failed to parse video info" }, { status: 500 }))
        }
      })
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
