#!/usr/bin/env python3
import json
import sys

import yt_dlp


def get_video_info(url):
    """Get video information using yt-dlp"""
    try:
        # Support passing cookies via environment variable `YTDL_COOKIES`
        cookies_path = os.environ.get("YTDL_COOKIES")
        ydl_opts = {
            "quiet": True,
            "no_warnings": True,
        }

        if cookies_path and os.path.exists(cookies_path):
            ydl_opts["cookiefile"] = cookies_path

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)

            return {
                "success": True,
                "title": info.get("title", "Unknown Title"),
                "thumbnail": info.get("thumbnail", ""),
                "duration": info.get("duration", 0),
                "channel": info.get("uploader", "Unknown Channel"),
                "view_count": info.get("view_count", 0),
                "upload_date": info.get("upload_date", ""),
                "description": info.get("description", "")[:200] + "..."
                if info.get("description")
                else "",
            }

    except Exception as e:
        return {"success": False, "error": str(e)}


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(
            json.dumps(
                {"success": False, "error": "Usage: python get_video_info.py <url>"}
            )
        )
        sys.exit(1)

    url = sys.argv[1]
    result = get_video_info(url)
    print(json.dumps(result))
