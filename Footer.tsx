import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-nx-line bg-nx-surface/60 px-4 py-10 md:px-10">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-8 md:flex-row md:justify-between">
        <div className="max-w-sm">
          <div className="flex items-center gap-2">
            <img src="/logo-nexus.png" alt="" className="h-9 w-9 rounded-full" />
            <span className="font-display text-lg font-extrabold">
              NEXUS<span className="text-nx-cyan">NET</span>XXI
            </span>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-nx-muted">
            Gunakan hanya sumber video dan siaran yang legal dan memiliki izin.
          </p>
        </div>
        <nav className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm text-nx-muted" aria-label="Footer">
          <Link to="/movies" className="hover:text-white">Movies</Link>
          <Link to="/series" className="hover:text-white">Series</Link>
          <Link to="/live-tv" className="hover:text-white">Live TV</Link>
          <Link to="/anime" className="hover:text-white">Anime</Link>
          <Link to="/sports" className="hover:text-white">Sports</Link>
          <Link to="/documentaries" className="hover:text-white">Documentaries</Link>
          <Link to="/kids" className="hover:text-white">Kids &amp; Family</Link>
          <Link to="/my-list" className="hover:text-white">My List</Link>
          <Link to="/request" className="hover:text-white">Request / Lapor</Link>
        </nav>
      </div>
      <p className="mx-auto mt-8 max-w-[1600px] text-xs text-nx-muted/70">
        &copy; {new Date().getFullYear()} NEXUSNETXXI
      </p>
    </footer>
  );
}
