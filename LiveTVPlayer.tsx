import { Radio } from 'lucide-react';
import type { LiveChannel } from '../types';
import VideoPlayer from './VideoPlayer';

export default function LiveTVPlayer({ channel }: { channel: LiveChannel }) {
  return (
    <div>
      {channel.streamUrl ? (
        <VideoPlayer key={channel.id} src={channel.streamUrl} title={channel.name} live />
      ) : (
        <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-xl border border-nx-line bg-black px-6 text-center">
          <Radio className="h-10 w-10 text-nx-muted" aria-hidden />
          <p className="text-sm font-medium">Siaran belum tersedia.</p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <h2 className="font-display text-xl font-bold">{channel.name}</h2>
        <span className="chip">{channel.category}</span>
        {channel.quality && <span className="chip">{channel.quality}</span>}
        {channel.liveStatus === 'replay' && <span className="chip">Tayang ulang</span>}
        {channel.liveStatus === 'scheduled' && <span className="chip">Terjadwal</span>}
        {channel.isDemo && <span className="badge-demo">DEMO</span>}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-nx-line bg-nx-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-nx-muted">Sedang tayang</p>
          <p className="mt-1 text-sm">{channel.nowPlaying ? channel.nowPlaying.title : 'Informasi jadwal belum tersedia.'}</p>
        </div>
        <div className="rounded-xl border border-nx-line bg-nx-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-nx-muted">Berikutnya</p>
          <p className="mt-1 text-sm">{channel.nextProgram ? channel.nextProgram.title : 'Informasi jadwal belum tersedia.'}</p>
        </div>
      </div>
    </div>
  );
}
