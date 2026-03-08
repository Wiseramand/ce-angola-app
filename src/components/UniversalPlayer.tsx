
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

  const getYouTubeId = (urlStr: string) => {
    if (!urlStr) return null;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = urlStr.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  };

  const isYouTube = (urlStr: string) => {
    return urlStr.includes('youtube.com') || urlStr.includes('youtu.be');
  };

  useEffect(() => {
    setError(null);
    setLoading(true);
    
    if (!url || url.trim() === "") {
      setLoading(false);
      return;
    }

    if (!isYouTube(url)) {
      const loadHls = () => {
        const Hls = (window as any).Hls;
        if (Hls && Hls.isSupported() && videoRef.current) {
          const hls = new Hls({ enableWorker: true });
          hls.loadSource(url);
          hls.attachMedia(videoRef.current);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setLoading(false);
            videoRef.current?.play().catch(() => {});
          });
          hls.on(Hls.Events.ERROR, (event: any, data: any) => {
            if (data.fatal) {
              setError("Sinal de Satélite instável ou inválido.");
              setLoading(false);
            }
          });
        } else if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
          videoRef.current.src = url;
          videoRef.current.addEventListener('loadedmetadata', () => setLoading(false));
        } else {
          setError("Este navegador não suporta streaming HLS.");
          setLoading(false);
        }
      };

      if (!(window as any).Hls) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
        script.async = true;
        script.onload = loadHls;
        document.body.appendChild(script);
      } else {
        loadHls();
      }
    } else {
      setLoading(false);
    }
  }, [url]);

  if (!url || url.trim() === "") {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/50 m-6 border-4 border-dashed border-white/5 rounded-[3rem] text-center p-12">
        <VideoOff size={60} className="text-white/10 mb-6" />
        <h3 className="text-white/40 font-black uppercase text-xs tracking-widest">Fora de Emissão</h3>
        <p className="text-slate-500 text-[10px] mt-4 font-bold uppercase tracking-tight max-w-[200px]">Aguardando conexão do sinal pelo Administrador Master.</p>
      </div>
    );
  }

  const ytId = isYouTube(url) ? getYouTubeId(url) : null;

  return (
    <div className="w-full h-full bg-black relative flex items-center justify-center">
      {loading && (
        <div className="absolute inset-0 z-30 bg-slate-950 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="text-ministry-gold animate-spin" size={48} />
          <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Sintonizando Canal...</span>
        </div>
      )}

      {ytId ? (
        <iframe
          className="w-full h-full border-0"
          src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      ) : (
        <div className="w-full h-full">
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500/80 p-10 text-center bg-red-950/20">
              <AlertCircle size={40} className="mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
            </div>
          ) : (
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              controls
              autoPlay
              playsInline
            ></video>
          )}
        </div>
      )}
    </div>
  );
};

export default UniversalPlayer;
