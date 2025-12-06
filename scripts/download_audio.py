#!/usr/bin/env python3
import yt_dlp
import sys
import json
import os
from pathlib import Path

def download_audio(url, format_id, output_path="downloads"):
    """Download audio using yt-dlp"""
    try:
        # Create downloads directory if it doesn't exist
        Path(output_path).mkdir(parents=True, exist_ok=True)
        
        # Configure yt-dlp options based on format
        format_map = {
            'mp3-128': {
                'format': 'bestaudio/best',
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': '128',
                }]
            },
            'mp3-256': {
                'format': 'bestaudio/best',
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': '256',
                }]
            },
            'mp3-320': {
                'format': 'bestaudio/best',
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': '320',
                }]
            },
            'wav': {
                'format': 'bestaudio/best',
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'wav',
                }]
            },
            'm4a': {
                'format': 'bestaudio/best',
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'm4a',
                }]
            }
        }
        
        config = format_map.get(format_id, format_map['mp3-320'])
        
        ydl_opts = {
            'format': config['format'],
            'outtmpl': f'{output_path}/%(title)s.%(ext)s',
            'noplaylist': True,
            'postprocessors': config.get('postprocessors', [])
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # Get video info first
            info = ydl.extract_info(url, download=False)
            
            # Download and convert
            ydl.download([url])
            
            # Determine the output filename after processing
            base_filename = ydl.prepare_filename(info)
            audio_ext = format_id.split('-')[0] if '-' in format_id else format_id
            audio_filename = os.path.splitext(base_filename)[0] + f'.{audio_ext}'
            
            return {
                'success': True,
                'filename': os.path.basename(audio_filename),
                'title': info.get('title', 'Unknown'),
                'filepath': audio_filename
            }
            
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(json.dumps({'success': False, 'error': 'Usage: python download_audio.py <url> <format>'}))
        sys.exit(1)
    
    url = sys.argv[1]
    format_id = sys.argv[2]
    
    result = download_audio(url, format_id)
    print(json.dumps(result))
