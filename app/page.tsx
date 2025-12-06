"use client"

import { useState } from "react"
import { Download, Youtube, Music, Video, Loader2, CheckCircle, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"

const videoFormats = [
  { value: "mp4-720p", label: "MP4 - 720p", size: "~50MB" },
  { value: "mp4-1080p", label: "MP4 - 1080p", size: "~100MB" },
  { value: "mp4-480p", label: "MP4 - 480p", size: "~25MB" },
  { value: "webm-720p", label: "WebM - 720p", size: "~40MB" },
  { value: "webm-1080p", label: "WebM - 1080p", size: "~80MB" },
]

const audioFormats = [
  { value: "mp3-320", label: "MP3 - 320kbps", size: "~8MB" },
  { value: "mp3-256", label: "MP3 - 256kbps", size: "~6MB" },
  { value: "mp3-128", label: "MP3 - 128kbps", size: "~3MB" },
  { value: "wav", label: "WAV - Lossless", size: "~50MB" },
  { value: "m4a", label: "M4A - High Quality", size: "~10MB" },
]

interface VideoInfo {
  title: string
  thumbnail: string
  duration: number
  channel: string
  view_count: number
  upload_date: string
  description: string
}

export default function YouTubeDownloader() {
  const [url, setUrl] = useState("")
  const [selectedVideoFormat, setSelectedVideoFormat] = useState("")
  const [selectedAudioFormat, setSelectedAudioFormat] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [downloadStatus, setDownloadStatus] = useState<"idle" | "success" | "error">("idle")
  const [statusMessage, setStatusMessage] = useState("")
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)

  const isValidYouTubeUrl = (url: string) => {
    const patterns = [/^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)/]
    return patterns.some((pattern) => pattern.test(url))
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formatViewCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M views`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K views`
    }
    return `${count} views`
  }

  const handleUrlSubmit = async () => {
    if (!isValidYouTubeUrl(url)) {
      setDownloadStatus("error")
      setStatusMessage("Please enter a valid YouTube URL (video or shorts)")
      return
    }

    setIsLoading(true)
    setDownloadStatus("idle")
    setStatusMessage("")

    try {
      const response = await fetch("/api/video-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      const result = await response.json()

      if (result.success) {
        setVideoInfo(result)
        setDownloadStatus("idle")
      } else {
        setDownloadStatus("error")
        setStatusMessage(result.error || "Failed to fetch video information")
      }
    } catch (error) {
      setDownloadStatus("error")
      setStatusMessage("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async (format: string, type: "video" | "audio") => {
    setIsLoading(true)
    setDownloadStatus("idle")
    setStatusMessage("")

    try {
      const endpoint = type === "video" ? "/api/download-video" : "/api/download-audio"

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, format }),
      })

      const result = await response.json()

      if (result.success) {
        setDownloadStatus("success")
        setStatusMessage(`Download completed: ${result.filename}`)

        // Trigger file download
        const downloadUrl = `/api/download-file?filename=${encodeURIComponent(result.filename)}`
        const link = document.createElement("a")
        link.href = downloadUrl
        link.download = result.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Reset success status after 5 seconds
        setTimeout(() => {
          setDownloadStatus("idle")
          setStatusMessage("")
        }, 5000)
      } else {
        setDownloadStatus("error")
        setStatusMessage(result.error || "Download failed")
      }
    } catch (error) {
      setDownloadStatus("error")
      setStatusMessage("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Youtube className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">YouTube Downloader</h1>
          </div>
          <p className="text-gray-600">Download YouTube videos and shorts in multiple formats</p>
        </div>

        {/* URL Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Enter YouTube URL
            </CardTitle>
            <CardDescription>Paste any YouTube video or shorts URL to get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">YouTube URL</Label>
              <div className="flex gap-2">
                <Input
                  id="url"
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleUrlSubmit} disabled={!url || isLoading}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Fetch Info"}
                </Button>
              </div>
            </div>

            {downloadStatus === "error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{statusMessage}</AlertDescription>
              </Alert>
            )}

            {downloadStatus === "success" && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{statusMessage}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Video Info */}
        {videoInfo && (
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <img
                  src={videoInfo.thumbnail || "/placeholder.svg?height=180&width=320"}
                  alt="Video thumbnail"
                  className="w-40 h-24 object-cover rounded-lg"
                />
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-lg line-clamp-2">{videoInfo.title}</h3>
                  <p className="text-sm text-gray-600">{videoInfo.channel}</p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>Duration: {formatDuration(videoInfo.duration)}</span>
                    <span>{formatViewCount(videoInfo.view_count)}</span>
                  </div>
                  {videoInfo.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">{videoInfo.description}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Download Options */}
        {videoInfo && (
          <Card>
            <CardHeader>
              <CardTitle>Download Options</CardTitle>
              <CardDescription>Choose your preferred format and quality</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="video" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="video" className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Video
                  </TabsTrigger>
                  <TabsTrigger value="audio" className="flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    Audio Only
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="video" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Video Format & Quality</Label>
                    <Select value={selectedVideoFormat} onValueChange={setSelectedVideoFormat}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select video format" />
                      </SelectTrigger>
                      <SelectContent>
                        {videoFormats.map((format) => (
                          <SelectItem key={format.value} value={format.value}>
                            <div className="flex justify-between items-center w-full">
                              <span>{format.label}</span>
                              <span className="text-xs text-gray-500 ml-2">{format.size}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    className="w-full"
                    disabled={!selectedVideoFormat || isLoading}
                    onClick={() => handleDownload(selectedVideoFormat, "video")}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download Video
                      </>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="audio" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Audio Format & Quality</Label>
                    <Select value={selectedAudioFormat} onValueChange={setSelectedAudioFormat}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select audio format" />
                      </SelectTrigger>
                      <SelectContent>
                        {audioFormats.map((format) => (
                          <SelectItem key={format.value} value={format.value}>
                            <div className="flex justify-between items-center w-full">
                              <span>{format.label}</span>
                              <span className="text-xs text-gray-500 ml-2">{format.size}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    className="w-full"
                    disabled={!selectedAudioFormat || isLoading}
                    onClick={() => handleDownload(selectedAudioFormat, "audio")}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download Audio
                      </>
                    )}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 text-center space-y-2">
              <Video className="w-8 h-8 mx-auto text-blue-500" />
              <h3 className="font-semibold">Multiple Formats</h3>
              <p className="text-sm text-gray-600">Support for MP4, WebM, and more</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center space-y-2">
              <Music className="w-8 h-8 mx-auto text-green-500" />
              <h3 className="font-semibold">Audio Extraction</h3>
              <p className="text-sm text-gray-600">Extract audio in MP3, WAV, M4A</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center space-y-2">
              <Download className="w-8 h-8 mx-auto text-purple-500" />
              <h3 className="font-semibold">Fast Downloads</h3>
              <p className="text-sm text-gray-600">Quick and reliable downloads</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
