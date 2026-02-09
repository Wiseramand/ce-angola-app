
import React, { useEffect, useRef, useState } from 'react';

interface UniversalPlayerProps {
  url: string;
  title: string;
}

const UniversalPlayer: React.FC<UniversalPlayerProps> = ({ url, title }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  const isYouTube = (url: string) => url.includes('youtube.com') || url.includes('youtu.be');

  const getYouTubeEmbedUrl = (url: string) => {
    if (url.includes('embed')) return url;
    let videoId = '';
    if (url.includes('v=')) videoId = url.split('v=')[1].split('&')[0];
    else if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1];
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&rel=0&modestbranding=1`;
  };

  useEffect(() => {
    setError(null);
    if (!url) return;

    if (!isYouTube(url) && (url.includes('.m3u8') || url.includes('stream'))) {
      const scriptId = 'hls-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
        script.async = true;
        script.onload = () => initHls();
        document.body.appendChild(script);
      } else {
        initHls();
      }
    }

    function initHls() {
      const Hls = (window as any).Hls;
      if (!Hls) return;

      if (Hls.isSupported() && videoRef.current) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(url);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.ERROR, (_: any, data: any) => {
          if (data.fatal) setError("Erro no sinal de vídeo. Verifique a fonte no OBS.");
        });
      } else if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = url;
      }
    }
  }, [url]);

  if (!url) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950">
        <div className="w-12 h-12 border-4 border-ministry-gold border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-display font-bold uppercase tracking-widest text-[10px]">A aguardar sinal da régia...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-6 text-center">
        <p className="text-red-500 font-bold mb-2">Sinal Interrompido</p>
        <p className="text-xs text-gray-400">{error}</p>
      </div>
    );
  }

  if (isYouTube(url)) {
    return (
      <iframe
        src={getYouTubeEmbedUrl(url)}
        title={title}
        className="absolute inset-0 w-full h-full"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    );
  }

  return (
    <video
      ref={videoRef}
      className="absolute inset-0 w-full h-full bg-black object-contain"
      controls
      autoPlay
      playsInline
      poster="https://images.unsplash.com/photo-1544427920-c49ccfb85579?q=80&w=2134&auto=format&fit=crop"
    />
  );
};

export default UniversalPlayer;
