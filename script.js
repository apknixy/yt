document.addEventListener('DOMContentLoaded', () => {
    const youtubeLinkInput = document.getElementById('youtubeLink');
    const downloadBtn = document.getElementById('downloadBtn');
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const resultsDiv = document.getElementById('results');
    const thumbnailImg = document.getElementById('thumbnail');
    const videoTitle = document.getElementById('videoTitle');
    const videoUploader = document.getElementById('videoUploader');
    const videoDownloadLinks = document.getElementById('videoDownloadLinks');
    const thumbnailDownloadLinks = document.getElementById('thumbnailDownloadLinks');

    // IMPORTANT: Replace this with the actual URL of your deployed backend server.
    const backendUrl = 'YOUR_BACKEND_SERVER_URL'; 

    downloadBtn.addEventListener('click', async () => {
        const link = youtubeLinkInput.value.trim();

        if (!link) {
            errorDiv.textContent = 'Please enter a YouTube link.';
            errorDiv.classList.remove('hidden');
            resultsDiv.classList.add('hidden');
            return;
        }

        loadingDiv.classList.remove('hidden');
        errorDiv.classList.add('hidden');
        resultsDiv.classList.add('hidden');
        videoDownloadLinks.innerHTML = '';
        thumbnailDownloadLinks.innerHTML = '';

        try {
            const response = await fetch(`${backendUrl}/download`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ youtube_url: link }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Something went wrong on the server.');
            }

            const data = await response.json();
            console.log(data); // For debugging

            if (data.error) {
                errorDiv.textContent = data.error;
                errorDiv.classList.remove('hidden');
                return;
            }

            thumbnailImg.src = data.thumbnail_url;
            videoTitle.textContent = data.title;
            videoUploader.textContent = `Uploader: ${data.uploader}`;

            // Video download links
            if (data.video_urls && data.video_urls.length > 0) {
                data.video_urls.forEach(video => {
                    const a = document.createElement('a');
                    a.href = video.url;
                    a.textContent = `Download Video (${video.quality})`;
                    a.download = `${data.title}_${video.quality}.mp4`; // Suggests filename
                    videoDownloadLinks.appendChild(a);
                });
            } else {
                videoDownloadLinks.innerHTML = '<p>No video download options available.</p>';
            }

            // Thumbnail download links
            if (data.thumbnail_url) {
                const a = document.createElement('a');
                a.href = data.thumbnail_url;
                a.textContent = 'Download High-Quality Thumbnail';
                a.download = `${data.title}_thumbnail.jpg`; // Suggests filename
                thumbnailDownloadLinks.appendChild(a);
            } else {
                thumbnailDownloadLinks.innerHTML = '<p>No thumbnail available.</p>';
            }

            resultsDiv.classList.remove('hidden');

        } catch (error) {
            console.error('Fetch error:', error);
            errorDiv.textContent = `Error: ${error.message}. Please check the YouTube link.`;
            errorDiv.classList.remove('hidden');
        } finally {
            loadingDiv.classList.add('hidden');
        }
    });
});
