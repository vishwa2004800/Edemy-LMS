import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// import { getOfflineVideo } from 

const OfflinePlayer = () => {
    const { courseId } = useParams();
    const [videoSrc, setVideoSrc] = useState(null);

    useEffect(() => {
        const fetchVideo = async () => {
            const videoUrl = await getOfflineVideo(courseId);
            if (!videoUrl) {
                alert("No offline video found. Please download it first.");
            }
            setVideoSrc(videoUrl);
        };
        fetchVideo();
    }, [courseId]);

    return (
        <div>
            <h2>Offline Video Player</h2>
            {videoSrc ? (
                <video controls width="720" src={videoSrc}></video>
            ) : (
                <p>Loading video...</p>
            )}
        </div>
    );
};

export default OfflinePlayer;
