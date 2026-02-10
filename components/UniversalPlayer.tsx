
import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, VideoOff, Loader2 } from 'lucide-react';

interface UniversalPlayerProps {
  url: string;
  title: string;
}

const UniversalPlayer: React.FC<UniversalPlayerProps> = ({ url, title }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Função robusta para extrair ID do YouTube de qualquer formato
  const getYouTubeId = (urlStr: string) => {
    if (!urlStr || urlStr.trim() === "") return null;
    
    try {
      const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
      const match = urlStr.match(regExp);
      if (match && match[7] && match[7].length === 11) {
        return match[7];
      }

      const urlObj = new URL(urlStr.includes('://') ? urlStr : `https://${urlStr}`);
      const pathParts = urlObj.pathname.split('/');
      
      if (pathParts.includes('live') || pathParts.includes('shorts')) {
        return pathParts[pathParts.length - 1];
      }

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
    setLoading(true);
    if (!url || url.trim() === "") {
      setLoading(false);
      return;
    }

    if (!isYouTube(url)) {
      const initHls = () => {
        const Hls = (window as any).Hls;
        if (Hls && Hls.isSupported() && videoRef.current) {
          const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(url);
          hls.attachMedia(videoRef.current);
          hls.on(Hls.Events.MANIFEST_PARSED, () => setLoading(false));
          hls.on(Hls.Events.ERROR, (_: any, data: any) => {
            if (data.fatal) {
              setError("Falha ao carregar stream HLS.");
              setLoading(false);
            }
          });
        } else if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
          videoRef.current.src = url;
          videoRef.current.onloadedmetadata = () => setLoading(false);
        } else {
          setError("Navegador não suportado para este formato.");
          setLoading(false);
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
    } else {
      // YouTube embeds carregam por si mesmos
      setLoading(false);
    }
  }, [url]);

  if (!url || url.trim() === "") {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-gray-500 p-6 text-center border-4 border-dashed border-white/5 m-4 rounded-[2rem]">
        <VideoOff size={64} className="mb-6 opacity-10" />
        <h3 className="font-black text-xs uppercase tracking-[0.3em] text-white/40">Sinal não Detetado</h3>
        <p className="text-[10px] mt-4 opacity-40 max-w-[200px] font-bold">O ADMINISTRADOR AINDA NÃO DEFINIU O LINK DESTA TRANSMISSÃO.</p>
      </div>
    );
  }

  const ytId = isYouTube(url) ? getYouTubeId(url) : null;

  return (
    <div className="w-full h-full bg-black relative flex items-center justify-center overflow-hidden">
      {loading && (
        <div className="absolute inset-0 z-20 bg-gray-950 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="text-ministry-gold animate-spin" size={48} />
          <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em]">Ligando ao Satélite</span>
        </div>
      )}

      {ytId ? (
        <iframe
          className="w-full h-full border-0 relative z-10"
          src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&showinfo=0&iv_load_policy=3`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setLoading(false)}
        ></iframe>
      ) : (
        <div className="w-full h-full relative">
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500/60 p-8 text-center bg-red-950/20">
              <AlertCircle size={48} className="mb-4" />
              <p className="text-xs font-black uppercase tracking-widest">{error}</p>
            </div>
          ) : (
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              controls
              autoPlay
              muted
              playsInline
            ></video>
          )}
        </div>
      )}
    </div>
  );
};

export default UniversalPlayer;
