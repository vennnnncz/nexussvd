import type { Episode, Season, Series } from '../types';
import { DEMO_VIDEOS } from './demoVideos';

/** Membuat season dengan ID episode yang stabil: `${seriesId}-s{n}e{m}`. */
function seasons(seriesId: string, counts: number[], demoVideo?: string): Season[] {
  return counts.map((count, i) => {
    const sn = i + 1;
    const episodes: Episode[] = Array.from({ length: count }, (_, j) => {
      const en = j + 1;
      return {
        id: `${seriesId}-s${sn}e${en}`,
        number: en,
        title: `Episode ${en}`,
        duration: 42 + ((j * 3) % 9),
        videoUrl: demoVideo && sn === 1 && en === 1 ? demoVideo : null,
      };
    });
    return { number: sn, episodes };
  });
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
  counts: number[],
  extra: { status?: 'Ongoing' | 'Ended'; trending?: boolean; demoVideo?: string } = {},
): Series {
  seq += 1;
  return {
    id,
    type: 'series',
    title,
    year,
    genres,
    hue,
    rating,
    synopsis,
    status: extra.status,
    trending: extra.trending,
    seasons: seasons(id, counts, extra.demoVideo),
    popularity: 100 - seq * 3,
    addedAt: new Date(Date.UTC(2025, 6, 10) - seq * 86400000 * 6).toISOString(),
    isDemo: true,
  };
}

// Semua serial di bawah ini fiktif dan hanya untuk DEMO.
export const series: Series[] = [
  mk('nx-sr-20581', 'Pelabuhan Sembilan', 2024, ['Drama', 'Crime'], 210, 8.4,
    'Konflik antarkeluarga pelabuhan memuncak ketika seorang pendatang mulai mengusik tatanan lama.',
    [8, 8, 6], { status: 'Ongoing', trending: true, demoVideo: DEMO_VIDEOS.sintel }),
  mk('nx-sr-20582', 'Kode Merah Jakarta', 2023, ['Action', 'Thriller'], 355, 7.9,
    'Unit khusus siber memburu kelompok peretas yang melumpuhkan infrastruktur kota.',
    [10, 10], { status: 'Ongoing', trending: true }),
  mk('nx-sr-20583', 'Lintas Dimensi', 2025, ['Sci-Fi', 'Mystery'], 270, 8.1,
    'Sekelompok mahasiswa menemukan portal di perpustakaan kampus yang selalu menuju tempat berbeda.',
    [8], { status: 'Ongoing', trending: true }),
  mk('nx-sr-20584', 'Dapur Nusantara', 2022, ['Comedy', 'Drama'], 30, 7.5,
    'Kisah chef muda yang mewarisi rumah makan keluarga sekaligus utang dan resep rahasianya.',
    [10, 10, 10], { status: 'Ended' }),
  mk('nx-sr-20585', 'Pulau Seribu Rahasia', 2021, ['Adventure', 'Mystery'], 165, 7.7,
    'Peserta ekspedisi terdampar di pulau yang menyimpan jejak peradaban yang hilang.',
    [6, 6], { status: 'Ended' }),
  mk('nx-sr-20586', 'Akademi Cakrawala', 2025, ['Drama', 'Family'], 295, 7.2,
    'Sehari-hari para siswa dan guru di sekolah asrama dengan tradisi yang tidak biasa.',
    [12], { status: 'Ongoing' }),
];
