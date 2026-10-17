import { useState, type FormEvent, type ReactNode } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { saveContent } from '../../lib/adminApi';
import { isSafeUrl } from '../../lib/media';
import type { RawItem } from '../../lib/mapper';

type FormType = 'movie' | 'series' | 'livetv';

interface EpForm {
  url: string;
  d1080: string;
  d720: string;
}
interface SeasonForm {
  name: string;
  episodes: EpForm[];
}

const GENRES: { group: string; items: string[] }[] = [
  { group: 'Aksi', items: ['Action', 'Adventure', 'Thriller', 'War', 'Western', 'Superhero'] },
  { group: 'Fiksi', items: ['Sci-Fi', 'Fantasy', 'Supernatural', 'Mecha', 'Isekai', 'Psychological'] },
  { group: 'Drama', items: ['Drama', 'Comedy', 'Romance', 'Horror', 'Mystery', 'Crime', 'Heist', 'Gangster', 'Dubbing'] },
  { group: 'Anime', items: ['Shounen', 'Shoujo', 'Seinen', 'Josei', 'Slice of Life', 'Harem'] },
  { group: 'Keluarga', items: ['Family', 'Edukasi', 'Lagu Anak', 'Legenda'] },
  { group: 'Non-Fiksi', items: ['Dokumenter', 'Biografi', 'Sejarah', 'Berita', 'Olahraga', 'Sport', 'Religi', 'Musikal', 'Game', 'Talk Show', 'Reality Show', 'Variety'] },
];

const emptyEp = (): EpForm => ({ url: '', d1080: '', d720: '' });

function toList<T>(v: T[] | Record<string, T> | undefined): T[] {
  if (!v) return [];
  return Array.isArray(v) ? v.filter(Boolean) : Object.values(v);
}

function epFromRaw(e: string | { url?: string; dl?: { '1080p'?: string; '720p'?: string } | null }): EpForm {
  if (typeof e === 'string') return { url: e, d1080: '', d720: '' };
  return { url: e.url ?? '', d1080: e.dl?.['1080p'] ?? '', d720: e.dl?.['720p'] ?? '' };
}

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-nx-muted">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-nx-muted">{hint}</span>}
    </label>
  );
}

interface Props {
  editId: string | null;
  initial?: RawItem;
  onDone: () => void;
}

export default function ContentForm({ editId, initial, onDone }: Props) {
  const i = initial;
  const [type, setType] = useState<FormType>(i?.type ?? 'movie');
  const [category, setCategory] = useState(i?.category && i.category !== 'Live TV' ? i.category : 'Film');
  const [title, setTitle] = useState(i?.title ?? '');
  const [poster, setPoster] = useState(i?.poster ?? '');
  const [synopsis, setSynopsis] = useState(i?.synopsis ?? '');
  const [language, setLanguage] = useState(i?.language ?? '');
  const [rating, setRating] = useState(i?.rating !== undefined ? String(i.rating) : '');
  const [trailer, setTrailer] = useState(i?.trailerUrl ?? '');
  const [schedule, setSchedule] = useState(i?.schedule && i.schedule !== 'Tersedia' ? i.schedule : '');
  const [genres, setGenres] = useState<string[]>(() => toList(i?.genres as string[] | Record<string, string> | undefined));

  const [url, setUrl] = useState(i?.url ?? '');
  const dlObj = typeof i?.downloadUrl === 'object' ? i.downloadUrl : undefined;
  const [d1080, setD1080] = useState(dlObj?.['1080p'] ?? '');
  const [d720, setD720] = useState(dlObj?.['720p'] ?? '');

  const [logo, setLogo] = useState(i?.channelLogo ?? '');
  const [quality, setQuality] = useState(i?.liveQuality ?? 'HD');
  const [liveStatus, setLiveStatus] = useState(i?.liveStatus ?? 'live');

  const [seasons, setSeasons] = useState<SeasonForm[]>(() => {
    const raw = toList(i?.seasons);
    if (raw.length > 0) {
      return raw.map((s, n) => ({ name: s.name ?? `Season ${n + 1}`, episodes: toList(s.episodes).map(epFromRaw) }));
    }
    if (i?.episodes) return [{ name: 'Season 1', episodes: toList(i.episodes).map(epFromRaw) }];
    return [{ name: 'Season 1', episodes: [emptyEp()] }];
  });

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const toggleGenre = (g: string) => setGenres((cur) => (cur.includes(g) ? cur.filter((x) => x !== g) : [...cur, g]));
  const updateEp = (si: number, ei: number, patch: Partial<EpForm>) =>
    setSeasons((cur) => cur.map((s, a) => (a !== si ? s : { ...s, episodes: s.episodes.map((e, b) => (b === ei ? { ...e, ...patch } : e)) })));

  const dl = (a: string, b: string) => {
    const o: Record<string, string> = {};
    if (a.trim()) o['1080p'] = a.trim();
    if (b.trim()) o['720p'] = b.trim();
    return Object.keys(o).length ? o : null;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!title.trim()) return setMsg({ ok: false, text: 'Judul wajib diisi.' });
    const upcoming = schedule.trim() !== '' && schedule.trim() !== 'Tersedia';

    const urls: string[] = [url, poster, trailer, logo, d1080, d720, ...seasons.flatMap((s) => s.episodes.flatMap((x) => [x.url, x.d1080, x.d720]))].filter((u) => u.trim());
    if (urls.some((u) => !isSafeUrl(u))) return setMsg({ ok: false, text: 'Semua link harus diawali http:// atau https://' });

    if (!upcoming) {
      if (type !== 'series' && !url.trim()) return setMsg({ ok: false, text: 'Link video / siaran wajib diisi (atau isi Jadwal untuk "Coming Soon").' });
      if (type === 'series' && !seasons.some((s) => s.episodes.some((x) => x.url.trim()))) return setMsg({ ok: false, text: 'Isi minimal satu link episode.' });
    }

    const data: Record<string, unknown> = {
      type,
      title: title.trim(),
      poster: poster.trim() || null,
      category: type === 'livetv' ? 'Live TV' : category,
      genres,
      synopsis: synopsis.trim() || null,
      language: language.trim() || null,
      rating: rating.trim() || null,
      trailerUrl: trailer.trim() || null,
      schedule: upcoming ? schedule.trim() : 'Tersedia',
      url: type === 'series' ? null : url.trim() || null,
      downloadUrl: type === 'movie' ? dl(d1080, d720) : null,
      seasons:
        type === 'series'
          ? seasons.map((s) => ({
              name: s.name.trim() || 'Season',
              episodes: s.episodes.filter((x) => x.url.trim()).map((x) => ({ url: x.url.trim(), dl: dl(x.d1080, x.d720) })),
            }))
          : null,
      channelLogo: type === 'livetv' ? logo.trim() || null : null,
      liveQuality: type === 'livetv' ? quality : null,
      liveStatus: type === 'livetv' ? liveStatus : null,
    };
    if (!editId) data.uploadedBy = 'Admin';

    setBusy(true);
    try {
      await saveContent(editId, data);
      setMsg({ ok: true, text: editId ? 'Perubahan disimpan.' : 'Konten ditambahkan.' });
      if (editId) onDone();
      else {
        setTitle('');
        setPoster('');
        setSynopsis('');
        setUrl('');
        setD1080('');
        setD720('');
        setGenres([]);
        setSchedule('');
        setSeasons([{ name: 'Season 1', episodes: [emptyEp()] }]);
      }
    } catch {
      setMsg({ ok: false, text: 'Gagal menyimpan. Pastikan sudah login dan Firebase Rules mengizinkan admin menulis.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <h2 className="font-display text-xl font-bold">{editId ? 'Edit konten' : 'Tambah konten'}</h2>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Tipe konten">
        {([['movie', 'Film'], ['series', 'Series'], ['livetv', 'Live TV']] as const).map(([v, l]) => (
          <button key={v} type="button" role="tab" aria-selected={type === v} onClick={() => setType(v)} disabled={!!editId && type !== v} className={`chip ${type === v ? 'chip-on' : ''}`}>
            {l}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Judul">
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        {type !== 'livetv' && (
          <Field label="Kategori">
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="Film">Film Indonesia</option>
              <option value="Film Luar">Film Luar</option>
              <option value="Anime">Anime</option>
              <option value="Kartun">Kartun</option>
            </select>
          </Field>
        )}
        <Field label={type === 'livetv' ? 'Logo channel (URL)' : 'Poster (URL gambar)'}>
          <input className="input" value={type === 'livetv' ? logo : poster} onChange={(e) => (type === 'livetv' ? setLogo(e.target.value) : setPoster(e.target.value))} placeholder="https://..." />
        </Field>
        <Field label="Jadwal tayang" hint='Kosongkan bila sudah tayang. Isi mis. "Senin" atau "Segera" untuk Coming Soon.'>
          <input className="input" value={schedule} onChange={(e) => setSchedule(e.target.value)} />
        </Field>
        {type !== 'livetv' && (
          <>
            <Field label="Bahasa">
              <input className="input" value={language} onChange={(e) => setLanguage(e.target.value)} />
            </Field>
            <Field label="Rating (0-10)">
              <input className="input" inputMode="decimal" value={rating} onChange={(e) => setRating(e.target.value)} />
            </Field>
            <Field label="Link trailer">
              <input className="input" value={trailer} onChange={(e) => setTrailer(e.target.value)} placeholder="https://..." />
            </Field>
          </>
        )}
      </div>

      <Field label="Sinopsis">
        <textarea className="input min-h-[96px] py-3" value={synopsis} onChange={(e) => setSynopsis(e.target.value)} />
      </Field>

      {type !== 'series' && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field label={type === 'livetv' ? 'Link siaran (.m3u8 / embed)' : 'Link video (.mp4 / .m3u8 / YouTube / embed)'} hint="Gunakan hanya sumber yang kamu miliki haknya atau yang memang diizinkan.">
              <input className="input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
            </Field>
          </div>
          {type === 'movie' && (
            <>
              <Field label="Unduh 1080p">
                <input className="input" value={d1080} onChange={(e) => setD1080(e.target.value)} />
              </Field>
              <Field label="Unduh 720p">
                <input className="input" value={d720} onChange={(e) => setD720(e.target.value)} />
              </Field>
            </>
          )}
          {type === 'livetv' && (
            <>
              <Field label="Kualitas">
                <select className="input" value={quality} onChange={(e) => setQuality(e.target.value)}>
                  {['SD', 'HD', 'FHD', '4K'].map((q) => (
                    <option key={q}>{q}</option>
                  ))}
                </select>
              </Field>
              <Field label="Status siaran">
                <select className="input" value={liveStatus} onChange={(e) => setLiveStatus(e.target.value)}>
                  <option value="live">Sedang Live</option>
                  <option value="replay">Tayang Ulang</option>
                  <option value="scheduled">Terjadwal</option>
                </select>
              </Field>
            </>
          )}
        </div>
      )}

      {type === 'series' && (
        <div className="space-y-4">
          {seasons.map((s, si) => (
            <fieldset key={si} className="rounded-xl border border-nx-line bg-nx-card p-4">
              <div className="mb-3 flex items-center gap-2">
                <input className="input" value={s.name} onChange={(e) => setSeasons((c) => c.map((x, a) => (a === si ? { ...x, name: e.target.value } : x)))} aria-label={`Nama season ${si + 1}`} />
                <button type="button" aria-label="Hapus season" onClick={() => setSeasons((c) => c.filter((_, a) => a !== si))} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg hover:bg-white/10">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3">
                {s.episodes.map((ep, ei) => (
                  <div key={ei} className="grid gap-2 md:grid-cols-[auto_1fr_1fr_1fr_auto] md:items-center">
                    <span className="text-xs font-semibold text-nx-muted">Ep {ei + 1}</span>
                    <input className="input" placeholder="Link video" value={ep.url} onChange={(e) => updateEp(si, ei, { url: e.target.value })} />
                    <input className="input" placeholder="Unduh 1080p" value={ep.d1080} onChange={(e) => updateEp(si, ei, { d1080: e.target.value })} />
                    <input className="input" placeholder="Unduh 720p" value={ep.d720} onChange={(e) => updateEp(si, ei, { d720: e.target.value })} />
                    <button type="button" aria-label={`Hapus episode ${ei + 1}`} onClick={() => setSeasons((c) => c.map((x, a) => (a === si ? { ...x, episodes: x.episodes.filter((_, b) => b !== ei) } : x)))} className="flex h-11 w-11 items-center justify-center rounded-lg hover:bg-white/10">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" className="chip mt-3" onClick={() => setSeasons((c) => c.map((x, a) => (a === si ? { ...x, episodes: [...x.episodes, emptyEp()] } : x)))}>
                <Plus className="mr-1 h-3 w-3" /> Tambah episode
              </button>
            </fieldset>
          ))}
          <button type="button" className="btn-ghost" onClick={() => setSeasons((c) => [...c, { name: `Season ${c.length + 1}`, episodes: [emptyEp()] }])}>
            <Plus className="h-4 w-4" /> Tambah season
          </button>
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-nx-muted">Genre</p>
        <div className="space-y-3">
          {GENRES.map((grp) => (
            <div key={grp.group}>
              <p className="mb-1 text-[11px] text-nx-muted">{grp.group}</p>
              <div className="flex flex-wrap gap-2">
                {grp.items.map((g) => (
                  <button key={g} type="button" aria-pressed={genres.includes(g)} onClick={() => toggleGenre(g)} className={`chip ${genres.includes(g) ? 'chip-on' : ''}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {msg && (
        <p role="status" className={`rounded-xl px-4 py-3 text-sm ${msg.ok ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}`}>
          {msg.text}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={busy} className="btn-primary">
          {busy ? 'Menyimpan...' : editId ? 'Simpan perubahan' : 'Tambah konten'}
        </button>
        {editId && (
          <button type="button" className="btn-ghost" onClick={onDone}>
            Batal
          </button>
        )}
      </div>
    </form>
  );
}
