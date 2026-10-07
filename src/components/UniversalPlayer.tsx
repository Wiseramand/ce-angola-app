import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AlertCircle, VideoOff, Loader2, Music, RefreshCw } from 'lucide-react';

interface UniversalPlayerProps {
  url: string;
  title: string;
  isAudioOnly?: boolean;
  quality?: 'fhd' | 'hd' | 'sd' | 'auto';
}

const UniversalPlayer: React.FC<UniversalPlayerProps> = ({ url, title, isAudioOnly, quality = 'auto' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isStalled, setIsStalled] = useState(false);
  const hlsRef = useRef<any>(null);
  const watchdogRef = useRef<number | null>(null);
  const retryCountRef = useRef(0);
  const lastTimeRef = useRef(0);
  const stalledCountRef = useRef(0);
  const isMountedRef = useRef(true);

  const getYouTubeId = (urlStr: string): string | null => {
    if (!urlStr) return null;
    // Suporta: youtu.be/ID, /watch?v=ID, /embed/ID, /live/ID, /v/ID, /shorts/ID
    const patterns = [
      /[?&]v=([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /\/(?:embed|live|v|shorts)\/([a-zA-Z0-9_-]{11})/,
    ];
    for (const pattern of patterns) {
      const match = urlStr.match(pattern);
      if (match && match[1] && match[1].length === 11) return match[1];
    }
    return null;
  };

  const isYouTube = (urlStr: string) => {
    return (urlStr || '').includes('youtube.com') || (urlStr || '').includes('youtu.be');
  };

  // Sincroniza para a ponta da live apenas se a defasagem for crítica (> 30s)
  const syncToLiveEdge = useCallback(() => {
    const video = videoRef.current;
    const hls = hlsRef.current;
    if (!video || !hls) return;

    try {
      if (typeof hls.liveSyncPosition === 'number' && hls.liveSyncPosition > 0) {
        const drift = hls.liveSyncPosition - video.currentTime;
        if (drift > 30) {
          console.info(`[Player] Defasagem de ${drift.toFixed(1)}s detectada. Ajustando suavemente para a live.`);
          video.currentTime = hls.liveSyncPosition;
        }
      }
    } catch (e) { /* ignorar erros */ }
  }, []);

  // Watchdog suave: recupera o vídeo apenas se estiver genuinamente travado
  const startWatchdog = useCallback((loadHls: () => void) => {
    if (watchdogRef.current) clearInterval(watchdogRef.current);
    watchdogRef.current = window.setInterval(() => {
      const video = videoRef.current;
      if (!video || !isMountedRef.current) return;

      // Se o vídeo não está em pausa, não terminou, mas o tempo não avançou
      if (!video.paused && !video.ended) {
        if (video.currentTime === lastTimeRef.current && video.readyState <= 2) {
          stalledCountRef.current++;
          console.warn(`[Player] Detetado buffer/stall (${stalledCountRef.current * 4}s)`);

          if (stalledCountRef.current === 1) {
            setIsStalled(true);
            const hls = hlsRef.current;
            if (hls) {
              try { hls.recoverMediaError(); } catch (e) { }
            }
            // Pula pequeno gap de buffer se existir
            if (video.buffered && video.buffered.length > 0) {
              const cur = video.currentTime;
              for (let i = 0; i < video.buffered.length; i++) {
                const bStart = video.buffered.start(i);
                if (bStart > cur && (bStart - cur) <= 1.0) {
                  video.currentTime = bStart + 0.1;
                  break;
                }
              }
            }
          } else if (stalledCountRef.current >= 3) {
            console.warn('[Player] Reconectando stream após pausa prolongada...');
            stalledCountRef.current = 0;
            setIsStalled(false);
            if (hlsRef.current) {
              try { hlsRef.current.destroy(); } catch (e) { }
              hlsRef.current = null;
            }
            const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000);
            retryCountRef.current++;
            setTimeout(loadHls, delay);
          }
        } else {
          // O vídeo está fluindo normalmente
          if (stalledCountRef.current > 0) {
            setIsStalled(false);
            stalledCountRef.current = 0;
          }
          syncToLiveEdge();
        }
        lastTimeRef.current = video.currentTime;
      }
    }, 4000) as unknown as number;
  }, [syncToLiveEdge]);

  const applyQuality = useCallback((hls: any) => {
    if (!hls || !hls.levels || hls.levels.length === 0) return;
    if (quality === 'auto') { hls.currentLevel = -1; return; }
    let targetHeight = quality === 'fhd' ? 1080 : quality === 'hd' ? 720 : 480;
    let bestLevel = 0, minDiff = Infinity;
    hls.levels.forEach((level: any, index: number) => {
      const diff = Math.abs(level.height - targetHeight);
      if (diff < minDiff) { minDiff = diff; bestLevel = index; }
    });
    hls.currentLevel = bestLevel;
  }, [quality]);

  useEffect(() => {
    isMountedRef.current = true;
    setError(null);
    setLoading(true);
    setIsStalled(false);
    retryCountRef.current = 0;
    stalledCountRef.current = 0;

    if (!url || url.trim() === "") {
      setLoading(false);
      return;
    }

    if (!isYouTube(url)) {
      const loadHls = () => {
        if (!isMountedRef.current) return;
        const Hls = (window as any).Hls;
        if (Hls && Hls.isSupported() && videoRef.current) {
          if (hlsRef.current) {
            try { hlsRef.current.destroy(); } catch (e) { }
          }

          const hls = new Hls({
            enableWorker: true,
            autoStartLoad: true,
            startLevel: -1,
            capLevelToPlayerSize: true,
            lowLatencyMode: false,
            backBufferLength: 30,
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
            maxBufferSize: 60 * 1000 * 1000,
            maxBufferHole: 0.5,
            highBufferWatchdogPeriod: 2,
            nudgeOffset: 0.2,
            nudgeMaxRetry: 6,
            liveSyncDurationCount: 3,
            liveMaxLatencyDurationCount: 10,
            liveDurationInfinity: true,
            startFragPrefetch: true,
            manifestLoadingTimeOut: 20000,
            manifestLoadingMaxRetry: 6,
            manifestLoadingRetryDelay: 1000,
            levelLoadingTimeOut: 20000,
            levelLoadingMaxRetry: 6,
            fragLoadingTimeOut: 25000,
            fragLoadingMaxRetry: 8,
            fragLoadingRetryDelay: 800,
            fragLoadingMaxRetryTimeout: 64000,
            abrBandWidthFactor: 0.8,
            abrBandWidthUpFactor: 0.7,
            abrEwmaDefaultEstimate: 500000,
          });

          hlsRef.current = hls;
          hls.loadSource(url);
          hls.attachMedia(videoRef.current);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            if (!isMountedRef.current) return;
            setLoading(false);
            setError(null);
            retryCountRef.current = 0;
            applyQuality(hls);
            startWatchdog(loadHls);
            const playPromise = videoRef.current?.play();
            if (playPromise !== undefined) {
              playPromise.catch(() => {
                if (videoRef.current) {
                  videoRef.current.muted = true;
                  videoRef.current.play().catch(() => { });
                }
              });
            }
          });

          hls.on(Hls.Events.FRAG_LOADED, () => {
            // Cada fragmento carregado com sucesso: reset do contador de stall
            stalledCountRef.current = 0;
            if (isMountedRef.current) setIsStalled(false);
          });

          hls.on(Hls.Events.ERROR, (_event: any, data: any) => {
            if (!isMountedRef.current) return;
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.warn('[HLS] Erro de rede — retomando carga...', data.details);
                  hls.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.warn('[HLS] Erro de media — recuperando...', data.details);
                  hls.recoverMediaError();
                  break;
                default:
                  console.warn('[HLS] Erro fatal — reiniciando em', retryCountRef.current + 1, 's');
                  try { hls.destroy(); } catch (e) { }
                  hlsRef.current = null;
                  const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 20000);
                  retryCountRef.current = Math.min(retryCountRef.current + 1, 5);
                  setTimeout(loadHls, delay);
                  break;
              }
            } else if (
              data.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR ||
              data.details === Hls.ErrorDetails.BUFFER_SEEK_OVER_HOLE
            ) {
              const video = videoRef.current;
              if (video && !video.paused && video.buffered && video.buffered.length > 0) {
                const cur = video.currentTime;
                for (let i = 0; i < video.buffered.length; i++) {
                  const start = video.buffered.start(i);
                  if (cur < start && (start - cur) <= 1.5) {
                    video.currentTime = start + 0.1;
                    break;
                  }
                }
              }
            }
          });
        } else if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
          // Safari nativo
          videoRef.current.src = url;
          videoRef.current.addEventListener('loadedmetadata', () => {
            if (isMountedRef.current) setLoading(false);
          });
          videoRef.current.play().catch(() => {
            if (videoRef.current) { videoRef.current.muted = true; videoRef.current.play().catch(() => { }); }
          });
        } else {
          setError('Este navegador não suporta streaming HLS.');
          setLoading(false);
        }
      };

      if (!(window as any).Hls) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
        script.async = true;
        script.onload = loadHls;
        script.onerror = () => {
          if (isMountedRef.current) { setError('Erro ao carregar player.'); setLoading(false); }
        };
        document.body.appendChild(script);
      } else {
        loadHls();
      }
    } else {
      setLoading(false);
    }

    return () => {
      isMountedRef.current = false;
      if (watchdogRef.current) { clearInterval(watchdogRef.current); watchdogRef.current = null; }
      if (hlsRef.current) { try { hlsRef.current.destroy(); } catch (e) { } hlsRef.current = null; }
    };
  }, [url]);

  // Mudar qualidade em tempo real
  useEffect(() => {
    if (hlsRef.current) applyQuality(hlsRef.current);
  }, [quality, applyQuality]);

  if (!url || url.trim() === '') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/50 m-0 border-4 border-dashed border-white/5 text-center p-12">
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

      {/* Indicador de reconexão silenciosa */}
      {isStalled && !loading && (
        <div className="absolute top-4 right-4 z-40 flex items-center space-x-2 bg-black/70 px-3 py-2 rounded-full border border-yellow-500/30">
          <RefreshCw size={12} className="text-yellow-400 animate-spin" />
          <span className="text-[9px] font-black text-yellow-400 uppercase tracking-widest">Reconectando...</span>
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
            <div className="relative w-full h-full">
              {isAudioOnly && (
                <div className="absolute inset-0 z-20 bg-slate-900 flex flex-col items-center justify-center space-y-6">
                  <div className="w-24 h-24 bg-ministry-gold/10 rounded-full flex items-center justify-center animate-pulse border border-ministry-gold/20">
                    <Music size={40} className="text-ministry-gold" />
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Emissão apenas Áudio</span>
                    <div className="flex items-center space-x-1.5 h-4">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div
                          key={i}
                          className="w-1 bg-ministry-gold rounded-full"
                          style={{
                            animation: `audioWave 1.2s ease-in-out infinite`,
                            animationDelay: `${i * 0.15}s`
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <video
                ref={videoRef}
                className={`w-full h-full object-contain ${isAudioOnly ? 'opacity-0' : ''}`}
                controls={!isAudioOnly}
                autoPlay
                playsInline
              ></video>
            </div>
          )}
        </div>
      )}
      <style>{`
        @keyframes audioWave {
          0%, 100% { height: 15%; }
          50% { height: 100%; }
        }
      `}</style>
    </div>
  );
};

export default UniversalPlayer;
