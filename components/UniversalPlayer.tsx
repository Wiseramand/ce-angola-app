
import React, { useEffect, useRef, useState } from 'react';

interface UniversalPlayerProps {
  url: string;
  title: string;
}

const UniversalPlayer: React.FC<UniversalPlayerProps> = ({ url, title }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  // Função robusta para extrair ID do YouTube de qualquer formato de URL
  const getYouTubeId = (url: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[7].length === 11) return match[7];
    
    // Suporte para links de live novos: youtube.com/live/ID
    if (url.includes('/live/')) {
      const parts = url.split('/live/');
      if (parts[1]) return parts[1].split('?')[0];
    }
    return null;
  };

  const isYouTube = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  useEffect(() => {
    setError(null);
    if (!url) return;

    // Se NÃO for YouTube e parecer um stream HLS (.m3u8 ou similar)
    if (!isYouTube(url)) {
      const scriptId = 'hls-script';
      
      const initHls = () => {
        const Hls = (window as any).Hls;
        if (Hls && Hls.isSupported() && videoRef.current) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });
          hls.loadSource(url);
          hls.attachMedia(videoRef.current);
          hls.on(Hls.Events.ERROR, (_: any, data: any) => {
            if (data.fatal) setError("Sinal HLS indisponível ou link inválido.");
          });
        } else if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
          videoRef.current.src = url;
        }
      };

      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
        script.async = true;
        script.onload = initHls;
        document.body.appendChild(script);
      } else {
        initHls();
      }
    }
  }, [url]);

  // Se não houver URL configurada no Admin
  if (!url || url.trim() === "") {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950 border border-white/5 rounded-3xl">
        <div className="w-12 h-12 border-4 border-ministry-gold border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-display font-bold uppercase tracking-widest text-[10px]">A aguardar sinal da régia...</p>
        <p className="text-gray-700 text-[8px] mt-2 uppercase">Configure o link no Painel Admin</p>
      </div>
    );
  }

  // Se for YouTube, renderiza o Iframe com o ID extraído
  if (isYouTube(url)) {
    const videoId = getYouTubeId(url);
    if (!videoId) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-6 text-center">
          <p className="text-red-500 font-bold mb-2">Link do YouTube Inválido</p>
          <p className="text-xs text-gray-400">Certifique-se de que o link do YouTube está correto no Admin.</p>
        </div>
      );
    }

    return (
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
        title={title}
        className="absolute inset-0 w-full h-full"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    );
  }

  // Se houver erro de sinal (HLS)
  if (error) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white p-6 text-center">
        <p className="text-ministry-gold font-bold mb-2">Sinal Interrompido</p>
        <p className="text-xs text-gray-400">{error}</p>
      </div>
    );
  }

  // Player padrão para links diretos/m3u8
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
