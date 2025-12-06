# #!/usr/bin/env python3
# import yt_dlp
# import sys
# import json
# import os
# from pathlib import Path

# def download_video(url, format_id, output_path="downloads"):
#     """Download video using yt-dlp"""
#     try:
#         # Create downloads directory if it doesn't exist
#         Path(output_path).mkdir(parents=True, exist_ok=True)

#         # Configure yt-dlp options based on format
#         format_map = {
#             'mp4-480p': 'best[height<=480][ext=mp4]',
#             'mp4-720p': 'best[height<=720][ext=mp4]',
#             'mp4-1080p': 'best[height<=1080][ext=mp4]',
#             'webm-720p': 'best[height<=720][ext=webm]',
#             'webm-1080p': 'best[height<=1080][ext=webm]'
#         }

#         ydl_opts = {
#             'format': format_map.get(format_id, 'best[ext=mp4]'),
#             'outtmpl': f'{output_path}/%(title)s.%(ext)s',
#             'noplaylist': True,
#         }

#         with yt_dlp.YoutubeDL(ydl_opts) as ydl:
#             # Get video info first
#             info = ydl.extract_info(url, download=False)
#             filename = ydl.prepare_filename(info)

#             # Download the video
#             ydl.download([url])

#             return {
#                 'success': True,
#                 'filename': os.path.basename(filename),
#                 'title': info.get('title', 'Unknown'),
#                 'filepath': filename
#             }

#     except Exception as e:
#         return {
#             'success': False,
#             'error': str(e)
#         }

# if __name__ == "__main__":
#     if len(sys.argv) != 3:
#         print(json.dumps({'success': False, 'error': 'Usage: python download_video.py <url> <format>'}))
#         sys.exit(1)

#     url = sys.argv[1]
#     format_id = sys.argv[2]

#     result = download_video(url, format_id)
#     print(json.dumps(result))


# #!/usr/bin/env python3
# import yt_dlp
# import sys
# import json
# import os
# from pathlib import Path

# def download_video(url, format_id, output_path="downloads"):
#     """Download video using yt-dlp"""
#     try:
#         Path(output_path).mkdir(parents=True, exist_ok=True)

#         format_map = {
#             'mp4-480p': 'bestvideo[height<=480]+bestaudio/best[height<=480]',
#             'mp4-720p': 'bestvideo[height<=720]+bestaudio/best[height<=720]',
#             'mp4-1080p': 'bestvideo[height<=1080]+bestaudio/best[height<=1080]',
#             'webm-720p': 'bestvideo[height<=720][ext=webm]+bestaudio/best[height<=720]',
#             'webm-1080p': 'bestvideo[height<=1080][ext=webm]+bestaudio/best[height<=1080]'
#         }

#         ydl_opts = {
#             'format': format_map.get(format_id, 'best[ext=mp4]'),
#             'outtmpl': f'{output_path}/%(title)s.%(ext)s',
#             'noplaylist': True,
#             'retries': 10,
#             'fragment-retries': 10,
#             'extractor-args': 'youtube:player-client=android',
#             'throttled-rate': '100K',
#             'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
#         }

#         with yt_dlp.YoutubeDL(ydl_opts) as ydl:
#             info = ydl.extract_info(url, download=False)
#             filename = ydl.prepare_filename(info)
#             ydl.download([url])

#             return {
#                 'success': True,
#                 'filename': os.path.basename(filename),
#                 'title': info.get('title', 'Unknown'),
#                 'filepath': filename
#             }

#     except Exception as e:
#         return {
#             'success': False,
#             'error': str(e)
#         }

# if __name__ == "__main__":
#     if len(sys.argv) != 3:
#         print(json.dumps({'success': False, 'error': 'Usage: python download_video.py <url> <format>'}))
#         sys.exit(1)

#     url = sys.argv[1]
#     format_id = sys.argv[2]

#     result = download_video(url, format_id)
#     print(json.dumps(result))

#!/usr/bin/env python3
import json
import os
import sys
from pathlib import Path

import yt_dlp


def download_video(url, format_id, output_path="downloads"):
    """Download video using yt-dlp"""
    try:
        Path(output_path).mkdir(parents=True, exist_ok=True)

        format_map = {
            "mp4-480p": "bestvideo[height<=480]+bestaudio/best[height<=480]",
            "mp4-720p": "bestvideo[height<=720]+bestaudio/best[height<=720]",
            "mp4-1080p": "bestvideo[height<=1080]+bestaudio/best[height<=1080]",
            "webm-720p": "bestvideo[height<=720][ext=webm]+bestaudio/best[height<=720]",
            "webm-1080p": "bestvideo[height<=1080][ext=webm]+bestaudio/best[height<=1080]",
        }

        # Allow passing cookies via env var `YTDL_COOKIES` or CLI arg.
        cookies_path = os.environ.get("YTDL_COOKIES")
        ydl_opts = {
            "format": format_map.get(format_id, "best[ext=mp4]"),
            "outtmpl": f"{output_path}/%(title)s.%(ext)s",
            "noplaylist": True,
            "quiet": True,  # Suppress all console output
            "no_warnings": True,  # Suppress warnings
        }

        if cookies_path and os.path.exists(cookies_path):
            ydl_opts["cookiefile"] = cookies_path

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # Get video info first
            info = ydl.extract_info(url, download=False)
            filename = ydl.prepare_filename(info)

            # Download the video
            ydl.download([url])

            # Return only JSON output
            return {
                "success": True,
                "filename": os.path.basename(filename),
                "title": info.get("title", "Unknown"),
                "filepath": filename,
            }

    except Exception as e:
        return {"success": False, "error": str(e)}


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(
            json.dumps(
                {
                    "success": False,
                    "error": "Usage: python download_video.py <url> <format>",
                }
            )
        )
        sys.exit(1)

    url = sys.argv[1]
    format_id = sys.argv[2]

    result = download_video(url, format_id)
    # Only print the JSON result (no other output)
    print(json.dumps(result))
