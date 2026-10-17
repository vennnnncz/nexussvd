import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import {
  AlertTriangle,
  Captions,
  Loader2,
  Maximize,
  Minimize,
  Pause,
  Play,
  RectangleHorizontal,
  RotateCcw,
  Volume2,
  VolumeX,
  VideoOff,
} from 'lucide-react';
import type { SubtitleTrack } from '../types';
import { formatTime } from '../lib/format';
import { embedSrc, getMediaKind } from '../lib/media';

interface Props {
  src: string | null;
  title: string;
  live?: boolean;
  subtitles?: SubtitleTrack[];
  /** Posisi awal (detik) untuk melanjutkan tontonan. */
  startAt?: number;
  theater?: boolean;
  onToggleTheater?: () => void;
  onProgress?: (position: number, duration: number) => void;
  onEnded?: () => void;
  unavailableMessage?: string;
  /** Tampilkan label bahwa sumber video adalah video contoh. */
  demoNotice?: boolean;
}

interface HlsHandle {
  destroy: () => void;
}

type FullscreenVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void };

export default function VideoPlayer({
  src,
  title,
  live = false,
  subtitles,
  startAt = 0,
  theater = false,
  onToggleTheater,
  onProgress,
  onEnded,
  unavailableMessage = 'Video belum tersedia untuk konten ini.',
  demoNotice = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideTimer = useRef<number | null>(null);
  const lastSave = useRef(0);
  const startRef = useRef(startAt);
  const lastPos = useRef({ t: 0, d: 0 });
  const progressRef = useRef(onProgress);
  progressRef.current = onProgress;

  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(!!src);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [attempt, setAttempt] = useState(0);

  // Siapkan sumber video (native atau HLS.js bila perlu).
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;
    setError(null);
    setLoading(true);
    setPlaying(false);

    const holder: { hls: HlsHandle | null } = { hls: null };
    let cancelled = false;
    const isHls = /\.m3u8($|\?)/i.test(src);

    const onLoaded = () => {
      const start = startRef.current;
      if (!live && start > 0 && Number.isFinite(video.duration) && start < video.duration - 5) {
        video.currentTime = start;
      }
    };
    video.addEventListener('loadedmetadata', onLoaded, { once: true });

    if (isHls && !video.canPlayType('application/vnd.apple.mpegurl')) {
      import('hls.js')
        .then(({ default: Hls }) => {
          if (cancelled) return;
          if (!Hls.isSupported()) {
            setError('Browser ini tidak mendukung format siaran tersebut.');
            setLoading(false);
            return;
          }
          const hls = new Hls();
          holder.hls = hls;
          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (data.fatal) {
              setError('Siaran terputus atau tidak dapat dimuat.');
              setLoading(false);
            }
          });
          hls.loadSource(src);
          hls.attachMedia(video);
        })
        .catch(() => {
          if (!cancelled) {
            setError('Pemutar siaran gagal dimuat.');
            setLoading(false);
          }
        });
    } else {
      video.src = src;
      video.load();
    }

    return () => {
      cancelled = true;
      video.removeEventListener('loadedmetadata', onLoaded);
      holder.hls?.destroy();
      video.removeAttribute('src');
      video.load();
    };
  }, [src, attempt, live]);

  // Simpan progres terakhir saat komponen dilepas.
  useEffect(
    () => () => {
      const { t, d } = lastPos.current;
      if (d > 0 && t > 0) progressRef.current?.(t, d);
    },
    [],
  );

  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const poke = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setShowControls(false), 3200);
  }, []);

  useEffect(() => () => {
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => setError('Pemutaran gagal dimulai. Coba lagi.'));
    } else {
      v.pause();
    }
  };

  const seek = (t: number) => {
    const v = videoRef.current;
    if (v && !live) v.currentTime = Math.max(0, Math.min(t, v.duration || t));
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const changeVolume = (val: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = val;
    v.muted = val === 0;
    setVolume(val);
    setMuted(v.muted);
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    const v = videoRef.current as FullscreenVideo | null;
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
    } else if (el?.requestFullscreen) {
      el.requestFullscreen().catch(() => undefined);
    } else if (v?.webkitEnterFullscreen) {
      v.webkitEnterFullscreen();
    }
  };

  const toggleCaptions = () => {
    const v = videoRef.current;
    if (!v) return;
    const next = !captionsOn;
    for (let i = 0; i < v.textTracks.length; i += 1) {
      v.textTracks[i].mode = next ? 'showing' : 'hidden';
    }
    setCaptionsOn(next);
  };

  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (!src || error) return;
    const key = e.key.toLowerCase();
    if (key === ' ' || key === 'k') {
      e.preventDefault();
      togglePlay();
    } else if (key === 'f') {
      toggleFullscreen();
    } else if (key === 'm') {
      toggleMute();
    } else if (key === 'arrowright' && !live) {
      seek(current + 5);
    } else if (key === 'arrowleft' && !live) {
      seek(current - 5);
    }
    poke();
  };

  const flushProgress = () => {
    const v = videoRef.current;
    if (v && Number.isFinite(v.duration) && v.duration > 0) {
      progressRef.current?.(v.currentTime, v.duration);
      lastSave.current = Date.now();
    }
  };

  const mediaKind = src ? getMediaKind(src) : null;
  if (src && (mediaKind === 'youtube' || mediaKind === 'embed')) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
        <iframe
          src={embedSrc(src)}
          title={title}
          className="absolute inset-0 h-full w-full border-0"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          referrerPolicy="origin"
        />
        {demoNotice && <span className="badge-demo absolute left-3 top-3">VIDEO DEMO</span>}
      </div>
    );
  }

  if (!src) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-xl border border-nx-line bg-black px-6 text-center">
        <VideoOff className="h-10 w-10 text-nx-muted" aria-hidden />
        <p className="text-sm font-medium text-nx-text">{unavailableMessage}</p>
      </div>
    );
  }

  const controlsVisible = showControls || !playing || !!error;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseMove={poke}
      onTouchStart={poke}
      aria-label={`Pemutar video: ${title}`}
      className={`group relative w-full overflow-hidden bg-black outline-none ${fullscreen ? 'h-full' : 'aspect-video rounded-xl'} ${theater ? 'ring-1 ring-nx-accent/40' : ''}`}
    >
      <video
        ref={videoRef}
        playsInline
        preload="metadata"
        className="h-full w-full bg-black object-contain"
        onClick={togglePlay}
        onPlay={() => setPlaying(true)}
        onPause={() => {
          setPlaying(false);
          if (!live) flushProgress();
        }}
        onWaiting={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
        onPlaying={() => {
          setLoading(false);
          setPlaying(true);
          setError(null);
        }}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          setCurrent(v.currentTime);
          if (Number.isFinite(v.duration)) lastPos.current = { t: v.currentTime, d: v.duration };
          if (!live && Date.now() - lastSave.current > 5000 && Number.isFinite(v.duration)) {
            lastSave.current = Date.now();
            progressRef.current?.(v.currentTime, v.duration);
          }
        }}
        onVolumeChange={(e) => {
          setVolume(e.currentTarget.volume);
          setMuted(e.currentTarget.muted);
        }}
        onError={() => {
          setLoading(false);
          setError(live ? 'Siaran terputus atau tidak dapat dimuat.' : 'Video tidak dapat dimuat. Periksa koneksi lalu coba lagi.');
        }}
        onEnded={() => {
          setPlaying(false);
          flushProgress();
          onEnded?.();
        }}
      >
        {subtitles?.map((s) => (
          <track key={s.src} kind="subtitles" src={s.src} srcLang={s.lang} label={s.label} />
        ))}
      </video>

      <div className="pointer-events-none absolute left-3 top-3 flex gap-2">
        {live && playing && !error && (
          <span className="flex items-center gap-1 rounded-md bg-red-600 px-2 py-0.5 text-[11px] font-bold tracking-wider">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> LIVE
          </span>
        )}
        {demoNotice && <span className="badge-demo">VIDEO DEMO</span>}
      </div>

      {loading && !error && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30" role="status" aria-label="Memuat video">
          <Loader2 className="h-10 w-10 animate-spin text-white" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/85 px-6 text-center">
          <AlertTriangle className="h-10 w-10 text-amber-400" aria-hidden />
          <p className="max-w-sm text-sm">{error}</p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              setAttempt((a) => a + 1);
            }}
          >
            <RotateCcw className="h-4 w-4" /> Coba lagi
          </button>
        </div>
      )}

      {!playing && !loading && !error && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="Putar"
          className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full bg-nx-accent/90 shadow-glow transition hover:scale-105"
        >
          <Play className="h-7 w-7 translate-x-0.5 fill-white" />
        </button>
      )}

      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-3 pb-2 pt-10 transition-opacity duration-300 ${
          controlsVisible ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        {!live && (
          <input
            type="range"
            aria-label="Posisi video"
            min={0}
            max={Number.isFinite(duration) && duration > 0 ? duration : 0}
            step={0.1}
            value={Math.min(current, duration || 0)}
            onChange={(e) => seek(Number(e.target.value))}
            className="h-5 w-full cursor-pointer accent-[#2f7bff]"
          />
        )}
        <div className="flex items-center gap-1 sm:gap-2">
          <button type="button" onClick={togglePlay} aria-label={playing ? 'Jeda' : 'Putar'} className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-white/10">
            {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </button>
          <button type="button" onClick={toggleMute} aria-label={muted ? 'Nyalakan suara' : 'Bisukan'} className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-white/10">
            {muted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
          <input
            type="range"
            aria-label="Volume"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={(e) => changeVolume(Number(e.target.value))}
            className="hidden h-5 w-20 cursor-pointer accent-[#2f7bff] sm:block"
          />
          {!live && (
            <span className="ml-1 text-xs tabular-nums text-white/80">
              {formatTime(current)} / {formatTime(duration)}
            </span>
          )}
          <span className="flex-1" />
          {subtitles && subtitles.length > 0 && (
            <button type="button" onClick={toggleCaptions} aria-label="Subtitle" aria-pressed={captionsOn} className={`flex h-11 w-11 items-center justify-center rounded-lg hover:bg-white/10 ${captionsOn ? 'text-nx-cyan' : ''}`}>
              <Captions className="h-5 w-5" />
            </button>
          )}
          {onToggleTheater && (
            <button type="button" onClick={onToggleTheater} aria-label="Mode teater" aria-pressed={theater} className={`hidden h-11 w-11 items-center justify-center rounded-lg hover:bg-white/10 md:flex ${theater ? 'text-nx-cyan' : ''}`}>
              <RectangleHorizontal className="h-5 w-5" />
            </button>
          )}
          <button type="button" onClick={toggleFullscreen} aria-label={fullscreen ? 'Keluar layar penuh' : 'Layar penuh'} className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-white/10">
            {fullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
