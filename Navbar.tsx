import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Bell, LogIn, Menu, Search, User, X } from 'lucide-react';

export const navLinks = [
  { to: '/home', label: 'Home' },
  { to: '/movies', label: 'Movies' },
  { to: '/series', label: 'Series' },
  { to: '/live-tv', label: 'Live TV' },
  { to: '/anime', label: 'Anime' },
  { to: '/sports', label: 'Sports' },
  { to: '/categories', label: 'Categories' },
  { to: '/my-list', label: 'My List' },
];

type Panel = 'menu' | 'bell' | 'user' | null;

export default function Navbar({ onSearch }: { onSearch: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const navigate = useNavigate();
  const taps = useRef({ n: 0, t: 0 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggle = (p: Panel) => setPanel((cur) => (cur === p ? null : p));
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive ? 'bg-nx-accent/20 text-white' : 'text-nx-muted hover:text-white'
    }`;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition duration-300 ${
        scrolled || panel ? 'glass shadow-lg shadow-black/40' : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-3 px-4 md:px-10">
        <Link
          to="/home"
          className="flex shrink-0 items-center gap-2"
          aria-label="NEXUSNETXXI - beranda"
          onClick={() => {
            // Ketuk logo 7x berturut-turut untuk membuka dashboard admin.
            const now = Date.now();
            taps.current = { n: now - taps.current.t < 1500 ? taps.current.n + 1 : 1, t: now };
            if (taps.current.n >= 7) {
              taps.current = { n: 0, t: 0 };
              navigate('/admin');
            }
          }}
        >
          <img src="/logo-nexus.png" alt="" className="h-10 w-10 rounded-full" />
          <span className="hidden font-display text-lg font-extrabold tracking-wide sm:block">
            NEXUS<span className="text-nx-cyan">NET</span>XXI
          </span>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
          {navLinks.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <button type="button" aria-label="Cari" onClick={onSearch} className="flex h-11 items-center gap-2 rounded-xl px-3 text-nx-muted transition hover:bg-white/10 hover:text-white">
            <Search className="h-5 w-5" />
            <span className="hidden text-xs xl:inline">Cari (tekan /)</span>
          </button>

          <div className="relative">
            <button type="button" aria-label="Notifikasi" onClick={() => toggle('bell')} className="flex h-11 w-11 items-center justify-center rounded-xl text-nx-muted transition hover:bg-white/10 hover:text-white">
              <Bell className="h-5 w-5" />
            </button>
            {panel === 'bell' && (
              <div className="glass absolute right-0 top-12 w-64 rounded-xl p-4 text-sm shadow-xl">
                <p className="font-semibold">Notifikasi</p>
                <p className="mt-1 text-nx-muted">Belum ada notifikasi.</p>
              </div>
            )}
          </div>

          <div className="relative">
            <button type="button" aria-label="Akun" onClick={() => toggle('user')} className="flex h-11 w-11 items-center justify-center rounded-xl text-nx-muted transition hover:bg-white/10 hover:text-white">
              <User className="h-5 w-5" />
            </button>
            {panel === 'user' && (
              <div className="glass absolute right-0 top-12 w-72 rounded-xl p-4 text-sm shadow-xl">
                <p className="font-semibold">Tamu</p>
                <p className="mt-1 text-nx-muted">
                  Login memerlukan backend autentikasi yang belum terhubung pada build DEMO ini. Daftar tontonan disimpan di perangkat ini.
                </p>
                <button type="button" disabled className="btn-ghost mt-3 w-full">
                  <LogIn className="h-4 w-4" /> Login (belum tersedia)
                </button>
                <Link to="/my-list" onClick={() => setPanel(null)} className="mt-2 block text-center text-xs text-nx-cyan hover:underline">
                  Buka My List
                </Link>
              </div>
            )}
          </div>

          <button type="button" aria-label={panel === 'menu' ? 'Tutup menu' : 'Buka menu'} onClick={() => toggle('menu')} className="flex h-11 w-11 items-center justify-center rounded-xl text-nx-muted transition hover:bg-white/10 hover:text-white lg:hidden">
            {panel === 'menu' ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {panel === 'menu' && (
        <nav className="grid grid-cols-2 gap-2 border-t border-nx-line px-4 pb-4 pt-3 lg:hidden" aria-label="Menu">
          {navLinks.map((l) => (
            <NavLink key={l.to} to={l.to} onClick={() => setPanel(null)} className={({ isActive }) => `${linkClass({ isActive })} min-h-[44px] flex items-center`}>
              {l.label}
            </NavLink>
          ))}
          <NavLink to="/documentaries" onClick={() => setPanel(null)} className={({ isActive }) => `${linkClass({ isActive })} min-h-[44px] flex items-center`}>
            Documentaries
          </NavLink>
          <NavLink to="/kids" onClick={() => setPanel(null)} className={({ isActive }) => `${linkClass({ isActive })} min-h-[44px] flex items-center`}>
            Kids &amp; Family
          </NavLink>
        </nav>
      )}
      {panel && panel !== 'menu' && (
        <button type="button" aria-label="Tutup panel" className="fixed inset-0 -z-10 cursor-default" onClick={() => setPanel(null)} />
      )}
    </header>
  );
}
