
import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, VideoOff } from 'lucide-react';

interface UniversalPlayerProps {
  url: string;
  title: string;
}

const UniversalPlayer: React.FC<UniversalPlayerProps> = ({ url, title }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  // Função robusta para extrair ID do YouTube de qualquer formato
  const getYouTubeId = (urlStr: string) => {
    if (!urlStr || urlStr.trim() === "") return null;
    
    try {
      // 1. Tentar Regex universal para YouTube
      const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
      const match = urlStr.match(regExp);
      if (match && match[7] && match[7].length === 11) {
        return match[7];
      }

      // 2. Tentar links de Live ou Shorts
      const urlObj = new URL(urlStr.includes('://') ? urlStr : `https://${urlStr}`);
      const pathParts = urlObj.pathname.split('/');
      
      if (pathParts.includes('live') || pathParts.includes('shorts')) {
        return pathParts[pathParts.length - 1];
      }

      // 3. Fallback para links curtos youtu.be/ID
      if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.slice(1);
      }
    } catch (e) {
      console.error("Erro ao processar URL:", e);
    }
    return null;
  };

  const isYouTube = (urlStr: string) => {
    return urlStr.toLowerCase().includes('youtube.com') || urlStr.toLowerCase().includes('youtu.be');
  };

  useEffect(() => {
    setError(null);
    if (!url || url.trim() === "") return;

    // Se não for YouTube, tenta carregar via HLS (m3u8)
    if (!isYouTube(url)) {
      const initHls = () => {
        const Hls = (window as any).Hls;
        if (Hls && Hls.isSupported() && videoRef.current) {
          const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(url);
          hls.attachMedia(videoRef.current);
          hls.on(Hls.Events.ERROR, (_: any, data: any) => {
            if (data.fatal) setError("Falha ao carregar stream HLS.");
          });
        } else if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
          videoRef.current.src = url;
        } else {
          setError("O seu navegador não suporta este formato de vídeo.");
        }
      };

      if (!(window as any).Hls) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
        script.async = true;
        script.onload = initHls;
        document.body.appendChild(script);
      } else {
        initHls();
      }
    }
  }, [url]);

  if (!url || url.trim() === "") {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-gray-500 p-6 text-center">
        <VideoOff size={48} className="mb-4 opacity-20" />
        <p className="font-bold text-sm uppercase tracking-widest">Aguardando Transmissão</p>
        <p className="text-xs mt-2 opacity-50">O administrador ainda não configurou o sinal para este canal.</p>
      </div>
    );
  }

  const ytId = isYouTube(url) ? getYouTubeId(url) : null;

  if (ytId) {
    return (
      <iframe
        className="w-full h-full border-0"
        src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    );
  }

  return (
    <div className="w-full h-full bg-black relative">
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400 p-4 text-center">
          <AlertCircle size={32} className="mb-2" />
          <p className="text-xs font-bold uppercase">{error}</p>
        </div>
      ) : (
        <video
          ref={videoRef}
          className="w-full h-full"
          controls
          autoPlay
          muted
          playsInline
        ></video>
      )}
    </div>
  );
};

export default UniversalPlayer;
