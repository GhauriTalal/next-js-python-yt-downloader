import { type NextRequest, NextResponse } from "next/server"
import path from "path"
import fs from "fs"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const raw = searchParams.get("filename")

    if (!raw) {
      return NextResponse.json({ error: "Filename is required" }, { status: 400 })
    }

    // Decode percent-encoded names, but fall back if decoding fails
    let decoded = raw
    try {
      decoded = decodeURIComponent(raw)
    } catch (e) {
      // keep raw if decode fails
    }

    // Prevent directory traversal and sanitize name
    const safeName = path.basename(decoded)
    const downloadsDir = path.join(process.cwd(), "downloads")
    const filePath = path.join(downloadsDir, safeName)

    // Extra safety: ensure resolved path is inside downloads dir
    const resolved = path.resolve(filePath)
    if (!resolved.startsWith(path.resolve(downloadsDir) + path.sep)) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 })
    }

    // Check file exists and is a file
    let stats: fs.Stats
    try {
      stats = await fs.promises.stat(resolved)
      if (!stats.isFile()) {
        return NextResponse.json({ error: "Not a file" }, { status: 404 })
      }
    } catch (err) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }

    // Determine content type based on file extension
    const ext = path.extname(safeName).toLowerCase()
    const contentTypeMap: { [key: string]: string } = {
      ".mp4": "video/mp4",
      ".webm": "video/webm",
      ".mp3": "audio/mpeg",
      ".wav": "audio/wav",
      ".m4a": "audio/mp4",
    }

    const contentType = contentTypeMap[ext] || "application/octet-stream"

    // Stream the file to avoid loading into memory
    const stream = fs.createReadStream(resolved)

    // Use RFC5987 encoding for UTF-8 filenames in Content-Disposition
    const disposition = `attachment; filename*=UTF-8''${encodeURIComponent(safeName)}`

    return new NextResponse(stream, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": stats.size.toString(),
        "Content-Disposition": disposition,
      },
    })
  } catch (error) {
    console.error("download-file error:", error)
    return NextResponse.json({ error: "Internal server error", details: String(error) }, { status: 500 })
  }
}
