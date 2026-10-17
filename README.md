# NEXUSNETXXI

Platform hiburan digital (Movies, Series, Live TV, Anime, Sports, Documentaries, Kids, My List).
Stack: React 18, TypeScript (TSX), Tailwind CSS, React Router, Lucide React, HLS.js, Firebase. Build memakai esbuild + Tailwind CLI (tanpa Vite).

## Menjalankan

```bash
npm install
npm run dev        # dev server http://localhost:5173 (rebuild otomatis)
npm run typecheck  # cek TypeScript saja
npm run build      # cek TypeScript + build produksi ke dist/
npm start          # pratinjau hasil build di http://localhost:4173
```

## Deploy ke Netlify

1. Push folder ini ke repo Git, lalu "Add new site" di Netlify.
2. Build command `npm run build`, publish directory `dist` (sudah diatur di `netlify.toml`).
3. Refresh pada route mana pun aman karena `public/_redirects` berisi `/* /index.html 200`.

Atau tanpa Git: jalankan `npm run build`, lalu drag-and-drop folder `dist` ke Netlify.

## Deploy ke Vercel

1. Import repo di Vercel. `vercel.json` sudah mengatur build `npm run build`, output `dist`, dan rewrite SPA agar refresh di semua route aman (pilih preset "Other" bila ditanya).
2. Atau lewat CLI: `npm i -g vercel`, lalu `vercel --prod`.

(`public/_redirects` hanya dipakai Netlify, `vercel.json` hanya dipakai Vercel. Keduanya aman berdampingan.)

## Struktur build

- `scripts/build.mjs`: bundle `src/main.tsx` dengan esbuild (code splitting), CSS dengan Tailwind CLI, salin `public/` ke `dist/`, lalu isi `index.html`.
- Variabel `PUBLIC_*` dibaca dari `.env` atau environment variable host dan ditanam saat build. Ubah nilai di Netlify/Vercel berarti harus deploy ulang.

## Aset

- `public/logo-nexus.png` : logo (dipakai navbar dan favicon)
- `public/banner-nexus.png` : banner hero beranda
- `public/channels/` : logo channel Live TV (isi field `logo` di `src/data/channels.ts`)

## Database & Admin (Firebase)

Konten diambil realtime dari Firebase Realtime Database (default: `kikircalc`, bisa diganti lewat `PUBLIC_FIREBASE_DATABASE_URL`) (`movies/`, `globalWatch/`, `announcements/`, `inbox/`). Data lama tidak diubah. Skema item lama (`type`, `category`, `url`, `seasons`, `downloadUrl`, `liveStatus`, dst.) dibaca apa adanya.

### 1. Environment variables
Isi di Netlify (Site settings > Environment variables) atau Vercel (Project > Settings > Environment Variables), atau di file `.env` lokal (contoh: `.env.example`):

- `PUBLIC_FIREBASE_API_KEY`, `PUBLIC_FIREBASE_AUTH_DOMAIN`, `PUBLIC_FIREBASE_PROJECT_ID`, `PUBLIC_FIREBASE_APP_ID`: Firebase Console > Project settings > Your apps > Web app (daftarkan web app bila belum ada). Nilai ini memang publik.
- `PUBLIC_FIREBASE_DATABASE_URL`: opsional, default sudah URL database lama.
- `PUBLIC_USE_DEMO_DATA=true`: hanya bila ingin tampil data contoh tanpa Firebase.

### 2. Akun admin
Firebase Console > Authentication > Sign-in method > aktifkan Email/Password > Users > Add user (email + password kuat). Buka `/admin` (atau ketuk logo 7x berturut-turut) lalu login.

### 3. Firebase Rules (penting)
Cari UID admin: Firebase Console > Authentication > Users > salin kolom "User UID". Lalu di Realtime Database > Rules, tempel ini dan ganti `ADMIN_UID` (4 tempat) dengan UID tadi, lalu Publish:

```json
{
  "rules": {
    "movies": { ".read": true, ".write": "auth.uid === 'ADMIN_UID'" },
    "announcements": { ".read": true, ".write": "auth.uid === 'ADMIN_UID'" },
    "globalWatch": { ".read": true, "$id": { ".write": true, ".validate": "newData.isNumber()" } },
    "inbox": {
      ".read": "auth.uid === 'ADMIN_UID'",
      ".write": "auth.uid === 'ADMIN_UID'",
      "$id": {
        ".read": true,
        ".write": "auth.uid === 'ADMIN_UID' || !data.exists()",
        ".validate": "newData.hasChildren(['name','message','type']) && newData.child('message').isString() && newData.child('message').val().length <= 600"
      }
    }
  }
}
```

Kenapa pakai UID, bukan `auth != null`: Web API key itu publik, jadi bila Email/Password aktif, orang lain bisa mendaftar sendiri lewat API Firebase dan otomatis dianggap "sudah login". Dengan UID, hanya akun adminmu yang boleh menulis. Node lain di database (di luar empat di atas) terkunci. Bila memakai database lama (`film-3f570`) yang berisi data app lama, backup dulu (Export JSON) karena app lama tidak bisa menulis lagi setelah rules ini dipasang.

### Fitur admin
Tambah/edit/hapus film, series (season + episode + link unduh), Live TV (logo, kualitas, status), jadwal "Coming Soon", inbox request/lapor dengan balasan, dan pengumuman.

## Data

Folder `src/data/` hanya berisi data contoh (DEMO) yang dipakai bila `PUBLIC_USE_DEMO_DATA=true`.

- Video: hanya beberapa konten memakai video contoh legal (film terbuka Blender) dan ditandai "VIDEO DEMO". Konten lain menampilkan "Video belum tersedia untuk konten ini."
- Live TV: `streamUrl` semua channel `null`, jadi tidak ada yang ditandai LIVE dan pemutar menampilkan "Siaran belum tersedia." Isi `streamUrl` (HLS `.m3u8` didukung lewat HLS.js) hanya dengan stream yang legal dan diizinkan, lalu set `isLive` sesuai status aktual.
- Sports: belum terhubung API. Semua acara berlabel DEMO, tanpa skor dan tanpa status LIVE.
- My List, Continue Watching, dan pencarian terakhir disimpan di `localStorage` (non-sensitif). Untuk sinkronisasi antarperangkat dan login, diperlukan backend.

## Keamanan

Tidak ada secret atau API key di frontend. Kode frontend selalu bisa dibaca pengguna; simpan kredensial dan logika sensitif di backend.
