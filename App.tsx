import { Suspense, lazy, useEffect, useState } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import BottomNavigation from './components/BottomNavigation';
import ErrorBoundary from './components/ErrorBoundary';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import PageLoader from './components/PageLoader';
import AnnouncementToast from './components/AnnouncementToast';
import SearchOverlay from './components/SearchOverlay';

const HomePage = lazy(() => import('./pages/HomePage'));
const MoviesPage = lazy(() => import('./pages/MoviesPage'));
const SeriesPage = lazy(() => import('./pages/SeriesPage'));
const LiveTVPage = lazy(() => import('./pages/LiveTVPage'));
const AnimePage = lazy(() => import('./pages/AnimePage'));
const SportsPage = lazy(() => import('./pages/SportsPage'));
const DocumentariesPage = lazy(() => import('./pages/DocumentariesPage'));
const KidsPage = lazy(() => import('./pages/KidsPage'));
const MyListPage = lazy(() => import('./pages/MyListPage'));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));
const MovieDetailPage = lazy(() => import('./pages/MovieDetailPage'));
const SeriesDetailPage = lazy(() => import('./pages/SeriesDetailPage'));
const AnimeDetailPage = lazy(() => import('./pages/AnimeDetailPage'));
const WatchPage = lazy(() => import('./pages/WatchPage'));
const RequestPage = lazy(() => import('./pages/RequestPage'));
const AdminPage = lazy(() => import('./pages/admin/AdminPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Layout() {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable);
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Navbar onSearch={() => setSearchOpen(true)} />
      <main className="flex-1 pb-20 md:pb-0">
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      <BottomNavigation onSearch={() => setSearchOpen(true)} />
      <AnnouncementToast />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/series" element={<SeriesPage />} />
        <Route path="/live-tv" element={<LiveTVPage />} />
        <Route path="/live-tv/:channelId" element={<LiveTVPage />} />
        <Route path="/anime" element={<AnimePage />} />
        <Route path="/sports" element={<SportsPage />} />
        <Route path="/documentaries" element={<DocumentariesPage />} />
        <Route path="/kids" element={<KidsPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/my-list" element={<MyListPage />} />
        <Route path="/request" element={<RequestPage />} />
        <Route path="/admin" element={<AdminPage />} />

        <Route path="/detail/movie/:movieId" element={<MovieDetailPage />} />
        <Route path="/detail/series/:seriesId" element={<SeriesDetailPage />} />
        <Route path="/detail/anime/:animeId" element={<AnimeDetailPage />} />

        <Route path="/watch/movie/:movieId" element={<WatchPage kind="movie" />} />
        <Route path="/watch/series/:seriesId/season/:seasonNumber/episode/:episodeNumber" element={<WatchPage kind="series" />} />
        <Route path="/watch/anime/:animeId/episode/:episodeNumber" element={<WatchPage kind="anime" />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
