import { NavLink } from 'react-router-dom';
import { Bookmark, Clapperboard, Home, Radio, Search, Tv } from 'lucide-react';

const items = [
  { to: '/home', label: 'Home', Icon: Home },
  { to: '/movies', label: 'Movies', Icon: Clapperboard },
  { to: '/series', label: 'Series', Icon: Tv },
  { to: '/live-tv', label: 'Live TV', Icon: Radio },
  { to: '/my-list', label: 'My List', Icon: Bookmark },
];

export default function BottomNavigation({ onSearch }: { onSearch: () => void }) {
  return (
    <nav
      aria-label="Navigasi bawah"
      className="glass pb-safe fixed inset-x-0 bottom-0 z-40 border-x-0 border-b-0 md:hidden"
    >
      <ul className="grid grid-cols-6">
        {items.map(({ to, label, Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition ${
                  isActive ? 'text-nx-cyan' : 'text-nx-muted'
                }`
              }
            >
              <Icon className="h-5 w-5" aria-hidden />
              {label}
            </NavLink>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={onSearch}
            className="flex min-h-[56px] w-full flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-nx-muted"
          >
            <Search className="h-5 w-5" aria-hidden />
            Cari
          </button>
        </li>
      </ul>
    </nav>
  );
}
