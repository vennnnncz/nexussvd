import type { Anime, Episode } from '../types';

function eps(animeId: string, count: number): Episode[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${animeId}-e${i + 1}`,
    number: i + 1,
    title: `Episode ${i + 1}`,
    duration: 24,
    videoUrl: null,
  }));
}

let seq = 0;
function mk(
  id: string,
  title: string,
  year: number,
  genres: string[],
  hue: number,
  rating: number,
  synopsis: string,
  format: 'series' | 'movie',
  count: number,
  extra: { status?: 'Ongoing' | 'Ended'; trending?: boolean } = {},
): Anime {
  seq += 1;
  return {
    id,
    type: 'anime',
    title,
    year,
    genres,
    hue,
    rating,
    synopsis,
    format,
    status: extra.status,
    trending: extra.trending,
    episodes: eps(id, count),
    popularity: 100 - seq * 3,
    addedAt: new Date(Date.UTC(2025, 7, 1) - seq * 86400000 * 5).toISOString(),
    isDemo: true,
  };
}

// Semua judul anime di bawah ini fiktif dan hanya untuk DEMO.
export const anime: Anime[] = [
  mk('nx-an-50101', 'Pedang Langit Biru', 2025, ['Action', 'Fantasy'], 220, 8.6,
    'Seorang pandai besi muda mewarisi pedang yang hanya bisa diayun ketika langit cerah.',
    'series', 12, { status: 'Ongoing', trending: true }),
  mk('nx-an-50102', 'Sekolah Para Bintang', 2024, ['Comedy', 'School'], 320, 7.8,
    'Kehidupan kelas yang dihuni murid dengan kemampuan aneh dan wali kelas yang selalu terlambat.',
    'series', 12, { status: 'Ended' }),
  mk('nx-an-50103', 'Mesin Waktu Nenek', 2023, ['Sci-Fi', 'Drama'], 185, 8.2,
    'Sebuah mesin tua di loteng membawa cucu menyaksikan masa muda neneknya.',
    'movie', 1, { status: 'Ended' }),
  mk('nx-an-50104', 'Penjaga Gerbang Kabut', 2025, ['Adventure', 'Mystery'], 260, 8.0,
    'Para penjaga gerbang harus memastikan kabut tidak membawa kembali yang telah pergi.',
    'series', 13, { status: 'Ongoing', trending: true }),
  mk('nx-an-50105', 'Ramen Sang Juara', 2022, ['Slice of Life', 'Comedy'], 20, 7.6,
    'Kedai ramen kecil bersaing dalam turnamen kuliner antar kota.',
    'series', 10, { status: 'Ended' }),
  mk('nx-an-50106', 'Bayangan di Menara', 2024, ['Thriller', 'Fantasy'], 285, 7.9,
    'Pendaki menara raksasa menemukan setiap lantai mengubah ingatan mereka.',
    'movie', 1, { status: 'Ended' }),
];
