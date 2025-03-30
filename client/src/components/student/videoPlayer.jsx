import { useEffect, useState } from "react";
import { saveVideoOffline, getOfflineVideo } from "./offlineStorage";

const VideoPlayer = ({ videoId, videoUrl }) => {
  const [offlineUrl, setOfflineUrl] = useState(null);

  useEffect(() => {
    async function checkOfflineVideo() {
      const storedVideoUrl = await getOfflineVideo(videoId);
      if (storedVideoUrl) setOfflineUrl(storedVideoUrl);
    }
    checkOfflineVideo();
  }, [videoId]);

  const handleDownload = async () => {
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      await saveVideoOffline(videoId, blob);
      alert("Video saved for offline viewing!");
    } catch (error) {
      console.error("Error downloading video:", error);
    }
  };

  return (
    <div>
      <video controls width="600" src={offlineUrl || videoUrl}></video>
      {offlineUrl ? (
        <p>Playing offline version</p>
      ) : (
        <button onClick={handleDownload}>Download for Offline</button>
      )}
    </div>
  );
};

export default VideoPlayer;
