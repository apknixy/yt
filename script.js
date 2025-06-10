function extractVideoID(url) {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^\s&]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function downloadThumbnail() {
  const url = document.getElementById('ytLink').value;
  const videoId = extractVideoID(url);
  if (!videoId) {
    alert("Invalid YouTube URL");
    return;
  }
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const resultDiv = document.getElementById('thumbnailResult');
  resultDiv.innerHTML = `
    <h3>Thumbnail:</h3>
    <img src="${thumbnailUrl}" alt="Thumbnail" />
    <a href="${thumbnailUrl}" download="thumbnail.jpg">
      <button>Download Thumbnail</button>
    </a>
  `;
}

function redirectToDownload() {
  const url = document.getElementById('ytLink').value;
  const videoId = extractVideoID(url);
  if (!videoId) {
    alert("Invalid YouTube URL");
    return;
  }

  // Redirect to third-party site like yt-download.org or savefrom
  window.open(`https://yt-download.org/api/button/videos/${videoId}`, '_blank');
}
