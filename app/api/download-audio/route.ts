import { type NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"
import fs from "fs"

export async function POST(request: NextRequest) {
  try {
    const { url, format } = await request.json()

    if (!url || !format) {
      return NextResponse.json({ success: false, error: "URL and format are required" }, { status: 400 })
    }

    const scriptPath = path.join(process.cwd(), "scripts", "download_audio.py")
    const downloadsPath = path.join(process.cwd(), "downloads")

    // Ensure downloads directory exists
    if (!fs.existsSync(downloadsPath)) {
      fs.mkdirSync(downloadsPath, { recursive: true })
    }

    // Try running the Python script with common python executables and robustly parse JSON output
    const runScript = (cmd: string) =>
      new Promise<{ code: number; stdout: string; stderr: string }>((res, rej) => {
        const child = spawn(cmd, [scriptPath, url, format])
        let stdout = ""
        let stderr = ""

        child.stdout.on("data", (data) => {
          stdout += data.toString()
        })

        child.stderr.on("data", (data) => {
          stderr += data.toString()
        })

        child.on("error", (err) => {
          rej(err)
        })

        child.on("close", (code) => {
          res({ code: code ?? 0, stdout, stderr })
        })
      })

    const candidates = ["python3", "python"]
    let runResult: { code: number; stdout: string; stderr: string } | null = null
    let lastErr: any = null

    for (const cmd of candidates) {
      try {
        runResult = await runScript(cmd)
        break
      } catch (e) {
        lastErr = e
      }
    }

    if (!runResult) {
      return NextResponse.json({ success: false, error: 'Failed to start Python process', detail: String(lastErr) }, { status: 500 })
    }

    const { code, stdout, stderr } = runResult

    if (code !== 0) {
      return NextResponse.json({ success: false, error: stderr || 'Download failed', details: stdout }, { status: 500 })
    }

    const output = stdout
    const error = stderr

    const tryParse = (str: string) => {
      try {
        return JSON.parse(str)
      } catch (e) {
        return null
      }
    }

    let result = tryParse(output)

    if (!result) {
      const first = output.indexOf('{')
      const last = output.lastIndexOf('}')
      if (first !== -1 && last !== -1 && last > first) {
        const candidate = output.substring(first, last + 1)
        result = tryParse(candidate)
      }
    }

    if (result) {
      return NextResponse.json(result)
    }

    console.error('Failed to parse JSON from python output. stdout:', output, 'stderr:', error)
    return NextResponse.json({ success: false, error: 'Failed to parse download result', stdout: output, stderr: error }, { status: 500 })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
