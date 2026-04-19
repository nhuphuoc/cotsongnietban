"use client";

import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";
import { cn } from "@/lib/utils";
import { youtubeNocookieEmbedUrl } from "@/lib/youtube-embed";

function formatTime(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type LessonVideoPlayerProps = {
  src: string;
  poster?: string;
  title: string;
  className?: string;
  /** Gắn trong cột học (full-bleed, không bo góc) — giống Udemy */
  variant?: "default" | "embed";
};

export function LessonVideoPlayer({
  src,
  poster,
  title,
  className,
  variant = "default",
}: LessonVideoPlayerProps) {
  const ytEmbed = useMemo(() => youtubeNocookieEmbedUrl(src), [src]);

  if (ytEmbed) {
    return (
      <div
        className={cn(
          "relative aspect-video w-full overflow-hidden bg-black",
          variant === "embed"
            ? "max-h-[min(70vh,calc(100vh-260px))] rounded-none shadow-none ring-0"
            : "max-h-[min(72vh,calc(100vh-220px))] rounded-xl shadow-xl ring-1 ring-csnb-border/50",
          className
        )}
      >
        <iframe
          src={ytEmbed}
          title={title}
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/70 via-black/25 to-transparent px-4 pb-8 pt-3 sm:pt-4">
          <p className="line-clamp-2 text-center font-sans text-xs font-semibold text-white/95 drop-shadow-md sm:text-left sm:text-sm">
            {title}
          </p>
        </div>
      </div>
    );
  }

  return (
    <LessonVideoPlayerHtml5
      src={src}
      poster={poster}
      title={title}
      className={className}
      variant={variant}
    />
  );
}

function LessonVideoPlayerHtml5({
  src,
  poster,
  title,
  className,
  variant = "default",
}: LessonVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(true);
  const [showUi, setShowUi] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const bumpUi = useCallback(() => {
    setShowUi(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (playing) setShowUi(false);
    }, 2800);
  }, [playing]);

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) void v.play().catch(() => {});
    else v.pause();
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlay = () => {
      setPlaying(true);
      bumpUi();
    };
    const onPause = () => {
      setPlaying(false);
      setShowUi(true);
    };
    const onTime = () => setCurrent(v.currentTime);
    const onMeta = () => setDuration(Number.isFinite(v.duration) ? v.duration : 0);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onMeta);
    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onMeta);
    };
  }, [src, bumpUi]);

  const seek = (t: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = t;
    setCurrent(t);
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const [fullscreen, setFullscreen] = useState(false);
  useEffect(() => {
    const onFs = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const toggleFs = async () => {
    const el = wrapRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) await el.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      /* ignore */
    }
  };

  return (
    <div
      ref={wrapRef}
      className={cn(
        "relative aspect-video w-full overflow-hidden bg-black",
        variant === "embed"
          ? "max-h-[min(70vh,calc(100vh-260px))] rounded-none shadow-none ring-0"
          : "max-h-[min(72vh,calc(100vh-220px))] rounded-xl shadow-xl ring-1 ring-csnb-border/50",
        className
      )}
      onMouseMove={bumpUi}
      onMouseLeave={() => playing && setShowUi(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="h-full w-full object-contain"
        playsInline
        muted={muted}
        preload="metadata"
        controlsList="nodownload"
        onContextMenu={(e) => e.preventDefault()}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/75 via-black/35 to-transparent px-4 pb-10 pt-4 sm:pt-5">
        <p className="pointer-events-none line-clamp-2 text-center font-sans text-xs font-semibold text-white/95 drop-shadow-md sm:text-left sm:text-sm">
          {title}
        </p>
      </div>

      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/35">
          <button
            type="button"
            onClick={togglePlay}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-csnb-orange text-white shadow-lg shadow-black/40 transition-transform hover:scale-105 hover:bg-csnb-orange-deep focus-visible:outline focus-visible:ring-2 focus-visible:ring-csnb-orange-bright focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:h-[4.5rem] sm:w-[4.5rem]"
            aria-label="Phát video"
          >
            <Play className="ml-1 size-8 shrink-0 sm:size-9" fill="currentColor" strokeWidth={0} />
          </button>
        </div>
      )}

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent px-3 pb-3 pt-10 transition-opacity duration-300 sm:px-4 sm:pb-4",
          showUi || !playing ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <input
          type="range"
          min={0}
          max={duration > 0 ? duration : 0}
          step={0.05}
          value={Math.min(current, duration || 0)}
          onChange={(e) => seek(parseFloat(e.target.value))}
          className="mb-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-csnb-orange [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
          aria-label="Thanh tiến trình"
        />
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={togglePlay}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label={playing ? "Tạm dừng" : "Phát"}
          >
            {playing ? <Pause className="size-4" /> : <Play className="ml-0.5 size-4" fill="currentColor" />}
          </button>
          <span className="font-mono text-[11px] tabular-nums text-white/90 sm:text-xs">
            {formatTime(current)} / {formatTime(duration)}
          </span>
          <button
            type="button"
            onClick={toggleMute}
            className="ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label={muted ? "Bật tiếng" : "Tắt tiếng"}
          >
            {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </button>
          <div className="flex-1" />
          <button
            type="button"
            onClick={toggleFs}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label={fullscreen ? "Thu nhỏ" : "Toàn màn hình"}
          >
            {fullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
