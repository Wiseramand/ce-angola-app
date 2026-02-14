import React, { useEffect, useRef } from 'react';
import { Play } from 'lucide-react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  streamSource: 'youtube' | 'custom';
  streamUrl: string;
  thumbnailUrl?: string;
  title: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ streamSource, streamUrl, thumbnailUrl, title }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('embed/')) return url;
    
    let videoId = '';
    if (url.includes('v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0` : url;
  };

  useEffect(() => {
    let hls: Hls | null = null;
    const video = videoRef.current;

    if (streamSource === 'custom' && streamUrl && streamUrl.includes('.m3u8') && video) {
      if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          video.play().catch(() => {
            video.muted = true;
            video.play();
          });
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', () => {
          video.play().catch(() => {
            video.muted = true;
            video.play();
          });
        });
      }
    }
    return () => {
      if (hls) hls.destroy();
    };
  }, [streamUrl, streamSource]);

  if (!streamUrl) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black">
         <img 
           src={thumbnailUrl || "https://picsum.photos/1200/800"} 
           alt="Stream Placeholder" 
           className="w-full h-full object-cover opacity-60"
         />
         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
         <div className="z-10 flex flex-col items-center">
            <div className="bg-white/10 p-6 rounded-full backdrop-blur-sm mb-4 animate-pulse">
                 <Play size={40} className="text-white/50" fill="currentColor" />
            </div>
            <p className="text-white font-bold tracking-widest text-sm uppercase">
              {title || "Waiting for Broadcast"}
            </p>
         </div>
      </div>
    );
  }

  if (streamSource === 'youtube') {
    return (
      <iframe 
        className="w-full h-full"
        src={getYoutubeEmbedUrl(streamUrl)}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowFullScreen
      ></iframe>
    );
  }

  if (streamUrl.includes('.m3u8') || streamUrl.endsWith('.mp4')) {
      return (
        <video 
            ref={videoRef}
            className="w-full h-full bg-black" 
            controls 
            autoPlay 
            playsInline
            poster={thumbnailUrl}
        >
            Your browser does not support the video tag.
        </video>
      );
  }

  return (
      <iframe 
        className="w-full h-full bg-black"
        src={streamUrl} 
        title={title}
        allowFullScreen
      ></iframe>
  );
};