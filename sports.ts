import type { SportCategory, SportsEvent } from '../types';

function ev(
  n: number,
  sport: SportCategory,
  league: string,
  title: string,
  startsAt: string | null,
  hue: number,
): SportsEvent {
  return {
    id: `nx-sp-${String(n).padStart(3, '0')}`,
    title,
    sport,
    league,
    startsAt,
    status: 'upcoming',
    streamUrl: null,
    description:
      'Data acara ini adalah contoh (DEMO) dan bukan jadwal resmi. Hubungkan API olahraga untuk jadwal, skor, dan status LIVE yang aktual.',
    hue,
    isDemo: true,
  };
}

export const sportCategories: SportCategory[] = [
  'Football', 'Basketball', 'Badminton', 'Motorsport', 'Tennis', 'Other Sports',
];

export const sportsEvents: SportsEvent[] = [
  ev(1, 'Football', 'Liga Demo', 'Garuda FC vs Nusantara United', '2026-11-08T19:00:00+07:00', 150),
  ev(2, 'Football', 'Piala Demo', 'Samudra FC vs Pegunungan City', '2026-11-15T16:00:00+07:00', 130),
  ev(3, 'Basketball', 'Liga Basket Demo', 'Elang Biru vs Harimau Timur', '2026-11-10T20:00:00+07:00', 25),
  ev(4, 'Badminton', 'Turnamen Demo Terbuka', 'Final Tunggal Putra (contoh)', '2026-11-22T14:00:00+07:00', 275),
  ev(5, 'Motorsport', 'Seri Balap Demo', 'Seri 5: Sirkuit Demo', null, 355),
  ev(6, 'Tennis', 'Demo Open', 'Semifinal Tunggal Putri (contoh)', '2026-12-02T15:00:00+07:00', 85),
  ev(7, 'Other Sports', 'Kejuaraan Demo', 'Final Renang 200m (contoh)', null, 195),
  ev(8, 'Football', 'Liga Demo', 'Borneo Stars vs Sumatra Lions', '2026-11-29T19:30:00+07:00', 160),
];
