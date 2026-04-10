# Virtual Pet DFA: keseharian di kampus

Aplikasi web sederhana (HTML, CSS, JavaScript tanpa framework) yang mensimulasikan **Virtual Pet** dengan perilaku **100% berbasis Deterministic Finite Automaton (DFA)**. Setiap aksi pengguna adalah simbol input dari alfabet Σ, lalu mesin berpindah state menurut fungsi transisi δ yang lengkap dan deterministik.

## Deskripsi pet

Pet adalah teman virtual mahasiswa di lingkungan kampus. Nama bawaan di form adalah **Jono** (bisa diganti). **Perubahan state** tidak diundi: tiap aksi ngikutin fungsi transisi δ (deterministik). Yang diacak cuma **kondisi awal** waktu halaman kebuka (atau setelah tombol “Acak kondisi awal lagi”), dipilih dari state yang masih hidup: `HAPPY`, `HUNGRY`, `TIRED`, `BORED`, `SICK`. Itu bukan bagian dari δ, cuma cara mulai simulasinya. Nama pet bisa diubah lewat kolom input di halaman utama.

## Daftar state (Q) + deskripsi

| State   | Deskripsi (tema kampus) |
|--------|-------------------------|
| HAPPY  | Lagi semangat ikut kelas, mood oke, siap nangkep materi. |
| HUNGRY | Laper abis kuliah, perut kosong, konsentrasi buyar. |
| TIRED  | Capek nugas, badan minta jeda dari tumpukan deadline. |
| BORED  | Bosen di kelas, jam kerasa lama, ngantuk-ngantuk guling. |
| SICK   | Udah kecapekan, badan drop, butuh istirahat beneran. |
| DEAD   | Burnout total, state akhir penyerap, nggak ada jalan keluar. |

## Daftar aksi (Σ) + deskripsi

| Aksi  | Deskripsi |
|-------|-----------|
| FEED  | Memberi makan, ngemil, atau makan di kantin. |
| PLAY  | Bermain atau aktivitas yang nguras energi. |
| SLEEP | Tidur atau istirahat. |
| CLEAN | Merawat, beres-beres, atau bantuan kesehatan (sesuai narasi). |

## Definisi formal DFA

- **Q** (himpunan state): `{ HAPPY, HUNGRY, TIRED, BORED, SICK, DEAD }`
- **Σ** (alfabet input / aksi): `{ FEED, PLAY, SLEEP, CLEAN }`
- **State awal (simulasi)**: dipilih **acak** dari `{ HAPPY, HUNGRY, TIRED, BORED, SICK }` (bukan `DEAD`). Ini cuma titik mulai; **δ tidak berubah**.
- **F** (himpunan state akhir): `{ DEAD }`
- **δ** (fungsi transisi): `δ : Q × Σ → Q`, diimplementasikan sebagai objek `transitions` di `js/script.js`. Untuk setiap `q ∈ Q` dan setiap `a ∈ Σ`, nilai `δ(q, a)` tepat satu state di `Q`. State **DEAD** **penyerap**: untuk semua `a ∈ Σ`, `δ(DEAD, a) = DEAD`.

### Tabel δ (selaras narasi di aplikasi)

| State  | FEED   | PLAY   | SLEEP  | CLEAN  |
|--------|--------|--------|--------|--------|
| HAPPY  | HAPPY  | TIRED  | HAPPY  | HAPPY  |
| HUNGRY | HAPPY  | SICK   | HUNGRY | BORED  |
| TIRED  | HAPPY  | SICK   | HAPPY  | HAPPY  |
| BORED  | HAPPY  | HAPPY  | TIRED  | HAPPY  |
| SICK   | TIRED  | DEAD   | HAPPY  | HAPPY  |
| DEAD   | DEAD   | DEAD   | DEAD   | DEAD   |

Intinya: lagi **HAPPY** terus dikasih makan tetap **HAPPY**; laper terus dikasih makan jadi **HAPPY**; capek plus tidur, makan, atau mandi cenderung balik **HAPPY** (kalau dipaksa main bisa **SICK**); bosen plus makan, main, atau beres jadi **HAPPY** (kalau tidur di kelas bisa **TIRED**); sakit plus istirahat, obat, atau makan lunak membaik; sakit tapi dipaksa main bisa **DEAD**; **DEAD** tetap nempel.

## Struktur project

```
virtual-pet-dfa/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
├── assets/          (opsional, tidak dipakai karakter utama)
└── README.md
```

### Karakter Pet Hiu (CSS)

Hiu **digambar penuh dengan HTML + CSS** (bukan file gambar). `updateUI()` mengatur `data-state` pada `#petCard`; semua ekspresi dan filter (SICK pucat, DEAD grayscale + transparan, mata X, dll.) mengikuti **state DFA** yang sama dengan logika di `script.js`.

## Cara menjalankan program

1. Buka folder `virtual-pet-dfa` di komputer Anda.
2. Buka file **`index.html`** dengan peramban web (Chrome, Edge, Firefox, dll.).
   - Cara paling mudah: klik dua kali `index.html`, atau seret file ke jendela browser.
3. Opsional: isi nama pet lalu klik **Simpan nama** (atau tekan Enter di kolom nama).
4. Kondisi awal pet **diacak** tiap kali halaman dibuka. Pakai **Acak kondisi awal lagi** untuk kosongin log dan ambil state awal baru (enak dipakai setelah Game Over).
5. Klik **Feed**, **Play**, **Sleep**, atau **Clean** untuk kasih input ke DFA. Log aktivitas keisi kayak obrolan.
6. Kalau state sampai **DEAD**, semua tombol aksi dimatikan dan pesan **Game Over** muncul.

> **Catatan:** Aplikasi ini nggak perlu server atau npm; cukup file statis. Kalau buka lewat `file://`, pastikan path `css/style.css` dan `js/script.js` relatif ke `index.html` sama kayak struktur di atas.

## File utama

- **`index.html`**: kerangka halaman, input nama, status pet, tombol aksi, log.
- **`css/style.css`**: warna tiap state, layout card, hover tombol, animasi ringan waktu ganti state, gaya log kayak chat.
- **`js/script.js`**: tabel `transitions`, acak awal `pickRandomStartState`, `handleAction`, `updateUI` (sinkron ke `#petCard[data-state]` + `aria-label` karakter), `getStateDescription`, `addLog`, `animatePet`, validasi DFA.
