export type MediaKind = 'file' | 'hls' | 'youtube' | 'embed';

const YT = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/i;

export function youtubeId(url: string): string | null {
  const m = url.match(YT);
  return m ? m[1] : null;
}

export function getMediaKind(url: string): MediaKind {
  if (youtubeId(url)) return 'youtube';
  if (/\.m3u8($|\?)/i.test(url)) return 'hls';
  if (/\.(mp4|webm|ogv|ogg|mov|m4v)($|\?)/i.test(url)) return 'file';
  return 'embed';
}

export function embedSrc(url: string): string {
  const id = youtubeId(url);
  return id ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1` : url;
}

/** Hanya izinkan http(s) untuk URL yang berasal dari database. */
export function isSafeUrl(url: string): boolean {
  return /^https?:\/\//i.test(url.trim());
}
