from flask import Flask, request, jsonify
from flask_cors import CORS
import yt_dlp
import os

app = Flask(__name__)
CORS(app) # This is crucial for allowing your frontend to make requests to this backend

@app.route('/')
def home():
    return "YouTube Downloader Backend is running!"

@app.route('/download', methods=['POST'])
def download_youtube_info():
    data = request.get_json()
    youtube_url = data.get('youtube_url')

    if not youtube_url:
        return jsonify({"error": "No YouTube URL provided"}), 400

    try:
        ydl_opts = {
            'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best', # Prioritize mp4
            'noplaylist': True, # Do not download playlists
            'quiet': True, # Suppress console output
            'extract_flat': True, # Only extract info, not download
            'force_generic_extractor': True, # Try to extract info even if no direct match
            'skip_download': True, # Don't actually download, just get info
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info_dict = ydl.extract_info(youtube_url, download=False) # Get info without downloading

        # Extract relevant information
        title = info_dict.get('title', 'No Title')
        uploader = info_dict.get('uploader', 'Unknown Uploader')
        thumbnail_url = info_dict.get('thumbnail', '')

        video_urls = []
        if 'formats' in info_dict:
            for f in info_dict['formats']:
                # Filter for common video formats and qualities
                if 'url' in f and 'ext' in f and 'format_note' in f:
                    if f['ext'] in ['mp4', 'webm'] and f['format_note'] not in ['DASH audio', 'DASH video']:
                        video_urls.append({
                            'quality': f.get('format_note', f.get('format_id', 'Unknown')),
                            'url': f['url']
                        })
        
        # Sort video qualities (e.g., 1080p, 720p, 480p)
        video_urls_sorted = sorted(video_urls, key=lambda x: int(''.join(filter(str.isdigit, x['quality'].split('p')[0]))) if 'p' in x['quality'] else 0, reverse=True)


        return jsonify({
            "title": title,
            "uploader": uploader,
            "thumbnail_url": thumbnail_url,
            "video_urls": video_urls_sorted,
            "error": None
        })

    except yt_dlp.utils.DownloadError as e:
        app.logger.error(f"yt-dlp error: {e}")
        return jsonify({"error": f"Could not process the YouTube link: {e}"}), 400
    except Exception as e:
        app.logger.error(f"Internal server error: {e}")
        return jsonify({"error": f"An unexpected error occurred: {e}"}), 500

if __name__ == '__main__':
    # For local development
    # On deployment, your hosting service will likely set the port (e.g., PORT environment variable)
    port = int(os.environ.get('PORT', 5000)) 
    app.run(debug=True, host='0.0.0.0', port=port)
  
