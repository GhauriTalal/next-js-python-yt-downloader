# YouTube Downloader (Next.js + yt-dlp)

A small Next.js app that fetches video info and downloads video/audio using yt-dlp via Python scripts.

## Prerequisites
- Node.js (v16+ recommended)
- pnpm (recommended) or npm
- Python 3 with yt-dlp and ffmpeg installed

Files:
- [package.json](package.json)
- [pnpm-lock.yaml](pnpm-lock.yaml)
- [requirements.txt](requirements.txt)
- [next.config.mjs](next.config.mjs)
- [tailwind.config.ts](tailwind.config.ts)
- [postcss.config.mjs](postcss.config.mjs)

Server scripts and APIs:
- API endpoints: [`POST`](app/api/video-info/route.ts), [`POST`](app/api/download-audio/route.ts), [`POST`](app/api/download-video/route.ts) — see [app/api/video-info/route.ts](app/api/video-info/route.ts), [app/api/download-audio/route.ts](app/api/download-audio/route.ts), [app/api/download-video/route.ts](app/api/download-video/route.ts)
- Python helpers: [scripts/get_video_info.py](scripts/get_video_info.py), [scripts/download_audio.py](scripts/download_audio.py), [scripts/download_video.py](scripts/download_video.py)
- Downloads directory: [downloads/](downloads/)

## Install

1. Install Node deps (pnpm recommended):
```bash
pnpm install