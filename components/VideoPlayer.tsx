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
  
  // Helper to extract YouTube ID if a full URL is pasted
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

  // Initialize HLS logic
  useEffect(() => {
    let hls: Hls | null = null;
    const video = videoRef.current;

    // Only run if it's a custom source and looks like an HLS stream (m3u8)
    if (streamSource === 'custom' && streamUrl && streamUrl.includes('.m3u8') && video) {
      if (Hls.isSupported()) {
        hls = new Hls({
          debug: false,
          enableWorker: true, // Improves performance by using web workers
          lowLatencyMode: true, // Prioritize lower latency
          backBufferLength: 90, // Keep 90s of back buffer
          // Tweak these for "Low Latency" vs "Stability" tradeoff
          // Trying to keep it close to live edge (~3 segments)
          liveSyncDurationCount: 3, 
          liveMaxLatencyDurationCount: 10,
          maxMaxBufferLength: 30,
        });
        
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          video.muted = false; // Try unmuted
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              console.log('Autoplay prevented. User interaction required.');
              video.muted = true; // Fallback to muted autoplay
              video.play();
            });
          }
        });
        
        // Robust Error handling to fix "stuttering/freezing"
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log('Network error, trying to recover...');
                hls?.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('Media error, trying to recover...');
                hls?.recoverMediaError();
                break;
              default:
                console.log('Fatal error, destroying player.');
                hls?.destroy();
                break;
            }
          }
        });

      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native support (Safari)
        video.src = streamUrl;
        video.addEventListener('loadedmetadata', () => {
          video.play().catch(e => {
            console.log('Autoplay blocked', e);
            video.muted = true;
            video.play();
          });
        });
      }
    }

    // Cleanup
    return () => {
      if (hls) {
        hls.destroy();
      }
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
            <p className="text-white/60 text-xs mt-2">Signal Offline</p>
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

  // Handle HLS or Direct Video
  if (streamUrl.includes('.m3u8') || streamUrl.endsWith('.mp4') || streamUrl.endsWith('.webm') || streamUrl.endsWith('.ogg')) {
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

  // Fallback for other embeds (Generic IFrames)
  return (
      <iframe 
        className="w-full h-full bg-black"
        src={streamUrl} 
        title={title}
        allowFullScreen
      ></iframe>
  );
};