import type { Movie, MovieCategory } from '../types';
import { DEMO_VIDEOS } from './demoVideos';

interface Opts {
  rating?: number;
  director?: string;
  cast?: string[];
  videoUrl?: string | null;
  trending?: boolean;
  category?: MovieCategory;
}

let seq = 0;
function mk(
  id: string,
  title: string,
  year: number,
  genres: string[],
  duration: number,
  hue: number,
  synopsis: string,
  opts: Opts = {},
): Movie {
  seq += 1;
  return {
    id,
    type: 'movie',
    category: opts.category ?? 'movie',
    title,
    year,
    genres,
    duration,
    hue,
    synopsis,
    rating: opts.rating,
    director: opts.director,
    cast: opts.cast,
    videoUrl: opts.videoUrl ?? null,
    trending: opts.trending,
    popularity: 100 - seq * 2,
    addedAt: new Date(Date.UTC(2025, 5, 30) - seq * 86400000 * 9).toISOString(),
    isDemo: true,
  };
}

// Semua judul, nama, dan sinopsis di bawah ini fiktif dan hanya untuk DEMO.
export const movies: Movie[] = [
  mk('nx-mv-10482', 'Cahaya di Ujung Nusantara', 2024, ['Adventure', 'Drama'], 128, 215,
    'Seorang navigator muda menyusuri jalur laut terlupakan demi menemukan mercusuar terakhir yang menyimpan rahasia keluarganya.',
    { rating: 8.1, director: 'Raka Pramudya', cast: ['Dinda Larasati', 'Bagas Wiratama', 'Sekar Anindita'], videoUrl: DEMO_VIDEOS.bunny, trending: true }),
  mk('nx-mv-10483', 'Orbit Terakhir', 2025, ['Sci-Fi', 'Thriller'], 117, 265,
    'Kru stasiun luar angkasa harus memutuskan siapa yang kembali ke Bumi ketika sistem pendukung kehidupan mulai gagal.',
    { rating: 7.8, director: 'Nadia Kusumo', cast: ['Arga Mahendra', 'Luna Prameswari'], videoUrl: DEMO_VIDEOS.sintel, trending: true }),
  mk('nx-mv-10484', 'Kota Tanpa Malam', 2023, ['Action', 'Crime'], 109, 195,
    'Di kota yang lampunya tak pernah padam, seorang mantan kurir memburu jaringan penyelundup data.',
    { rating: 7.2, director: 'Bima Santoso', cast: ['Rizal Hakim', 'Mira Handayani'], videoUrl: DEMO_VIDEOS.steel, trending: true }),
  mk('nx-mv-10485', 'Bisikan Hutan Hujan', 2022, ['Fantasy', 'Adventure'], 121, 150,
    'Dua saudara menemukan peta hidup yang menuntun mereka ke jantung hutan tempat legenda masih bernapas.',
    { rating: 7.6, director: 'Sari Wulandari', cast: ['Tiara Mahesa', 'Dimas Aryo'] }),
  mk('nx-mv-10486', 'Senja di Meja Makan', 2021, ['Drama', 'Family'], 98, 25,
    'Satu keluarga berkumpul setelah bertahun-tahun, dan setiap hidangan membuka cerita yang selama ini disimpan.',
    { rating: 8.0, director: 'Laras Setiawan', cast: ['Wulan Prakoso', 'Hendra Gunadi'] }),
  mk('nx-mv-10487', 'Garis Merah', 2025, ['Thriller', 'Mystery'], 112, 350,
    'Seorang auditor menemukan satu angka yang tidak cocok, dan angka itu mengarah pada rahasia yang berbahaya.',
    { rating: 7.4, director: 'Yoga Ardiansyah', cast: ['Citra Maheswari', 'Fajar Nugraha'], trending: true }),
  mk('nx-mv-10488', 'Tawa di Atas Roda', 2020, ['Comedy', 'Road Trip'], 94, 45,
    'Tiga sahabat menempuh perjalanan darat dengan bus tua demi menghadiri pernikahan yang hampir terlambat.',
    { rating: 6.9, director: 'Dewi Kartika', cast: ['Joko Prasetyo', 'Ayu Lestari'] }),
  mk('nx-mv-10489', 'Samudra Biru Gelap', 2024, ['Horror', 'Mystery'], 103, 230,
    'Ekspedisi penyelaman mendengar suara dari kedalaman yang seharusnya tidak berpenghuni.',
    { rating: 7.0, director: 'Eko Sutrisno', cast: ['Nanda Pertiwi', 'Galih Ramadhan'] }),
  mk('nx-mv-10490', 'Melodi untuk Rania', 2023, ['Romance', 'Music'], 106, 320,
    'Seorang pianis yang kehilangan pendengarannya belajar menulis lagu lewat getaran dan kenangan.',
    { rating: 7.7, director: 'Mega Puspita', cast: ['Rania Azzahra', 'Ilham Ferdiansyah'] }),
  mk('nx-mv-10491', 'Titik Nol', 2022, ['Action', 'Sci-Fi'], 124, 205,
    'Tim penyelamat berpacu dengan waktu untuk menghentikan eksperimen energi yang lepas kendali.',
    { rating: 7.3, director: 'Bayu Anggoro', cast: ['Satria Wibisono', 'Kirana Dewi'] }),
  mk('nx-mv-10492', 'Pasar Malam Terakhir', 2021, ['Drama', 'Fantasy'], 101, 285,
    'Pasar malam yang muncul hanya setahun sekali menawarkan satu permintaan kepada siapa pun yang berani.',
    { rating: 7.5, director: 'Tari Nirmala', cast: ['Putri Anjani', 'Reza Maulana'] }),
  mk('nx-mv-10493', 'Jejak di Atas Es', 2025, ['Adventure', 'Survival'], 115, 190,
    'Tim peneliti terjebak badai kutub dan harus bergantung pada satu sama lain untuk bertahan hidup.',
    { rating: 7.1, director: 'Andre Kurniawan', cast: ['Vina Octaviani', 'Teguh Santika'], trending: true }),

  // Documentaries
  mk('nx-dc-30101', 'Hutan Tropis: Denyut Kehidupan', 2023, ['Nature'], 52, 140,
    'Dokumenter fiktif tentang ekosistem hutan hujan dari kanopi hingga akar.',
    { rating: 8.3, category: 'documentary', director: 'Tim Produksi Demo', videoUrl: DEMO_VIDEOS.bunny }),
  mk('nx-dc-30102', 'Rahasia Atom', 2022, ['Science'], 58, 255,
    'Menjelaskan cara ilmuwan memetakan materi pada skala terkecil.',
    { rating: 7.9, category: 'documentary', director: 'Tim Produksi Demo' }),
  mk('nx-dc-30103', 'Jalur Rempah', 2021, ['History'], 63, 35,
    'Menelusuri sejarah perdagangan rempah yang menghubungkan pulau-pulau dan benua.',
    { rating: 8.0, category: 'documentary', director: 'Tim Produksi Demo' }),
  mk('nx-dc-30104', 'Era Mesin Berpikir', 2024, ['Technology'], 55, 275,
    'Perjalanan perkembangan komputasi dan kecerdasan buatan dari sudut pandang sehari-hari.',
    { rating: 7.7, category: 'documentary', director: 'Tim Produksi Demo' }),
  mk('nx-dc-30105', 'Tangan Perajin', 2020, ['Biography'], 48, 15,
    'Potret seorang perajin keramik generasi ketiga dan keputusannya mempertahankan tradisi.',
    { rating: 7.8, category: 'documentary', director: 'Tim Produksi Demo' }),
  mk('nx-dc-30106', 'Samudra Hidup', 2025, ['Nature', 'Science'], 60, 200,
    'Menyelami lapisan laut dan makhluk yang bergantung pada arus.',
    { rating: 8.2, category: 'documentary', director: 'Tim Produksi Demo' }),

  // Kids & Family
  mk('nx-kd-40101', 'Petualangan Si Kunang', 2024, ['Animation'], 76, 55,
    'Kunang-kunang kecil belajar bersinar demi membantu teman-temannya pulang saat gelap.',
    { rating: 7.9, category: 'kids', videoUrl: DEMO_VIDEOS.bunny }),
  mk('nx-kd-40102', 'Liburan Keluarga Bumi', 2023, ['Family Movies'], 92, 170,
    'Keluarga ceria menjelajah pulau-pulau dan belajar menjaga lingkungan.',
    { rating: 7.3, category: 'kids' }),
  mk('nx-kd-40103', 'Belajar Bersama Bintang', 2022, ['Educational'], 45, 240,
    'Pengantar tata surya dengan bahasa sederhana dan banyak eksperimen.',
    { rating: 8.0, category: 'kids' }),
  mk('nx-kd-40104', 'Kota Kecil Ceria', 2025, ['Animation', 'Family Movies'], 81, 330,
    'Penduduk kota kecil bekerja sama membuat festival terbesar yang pernah ada.',
    { rating: 7.5, category: 'kids' }),
];

export const movieOnly = movies.filter((m) => m.category === 'movie');
export const documentaries = movies.filter((m) => m.category === 'documentary');
export const kidsContent = movies.filter((m) => m.category === 'kids');
