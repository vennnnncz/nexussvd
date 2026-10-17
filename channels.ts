import type { ChannelCategory, LiveChannel } from '../types';

function ch(id: number, name: string, category: ChannelCategory, hue: number): LiveChannel {
  return {
    id: `nx-tv-${String(id).padStart(3, '0')}`,
    name,
    logo: null,
    category,
    streamUrl: null,
    isLive: false,
    nowPlaying: null,
    nextProgram: null,
    hue,
    isDemo: true,
  };
}

// Channel di bawah ini hanya contoh struktur (DEMO). Belum ada stream resmi yang terhubung,
// sehingga tidak ada channel yang ditandai LIVE. Isi `streamUrl` hanya dengan stream yang legal
// dan diizinkan, lalu set `isLive` sesuai status aktual dari backend/EPG Anda.
export const channels: LiveChannel[] = [
  ch(1, 'Demo Channel', 'Entertainment', 215),
  ch(2, 'Nexus News Demo', 'News', 200),
  ch(3, 'Nexus Movies Demo', 'Movies', 265),
  ch(4, 'Nexus Sports Demo', 'Sports', 150),
  ch(5, 'Nexus Music Demo', 'Music', 320),
  ch(6, 'Nexus Edu Demo', 'Education', 40),
  ch(7, 'Nexus Kids Demo', 'Kids', 55),
  ch(8, 'Nexus World Demo', 'International', 185),
  ch(9, 'Nexus Drama Demo', 'Entertainment', 340),
  ch(10, 'Nexus Docu Demo', 'Education', 100),
  ch(11, 'Nexus Cinema 2 Demo', 'Movies', 245),
  ch(12, 'Nexus Arena Demo', 'Sports', 10),
];

export const channelCategories: ChannelCategory[] = [
  'News', 'Entertainment', 'Movies', 'Sports', 'Music', 'Education', 'Kids', 'International',
];
