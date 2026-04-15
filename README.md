Link Preview Pet : https://virtual-pet-tekom.vercel.app/

# 🦈 Virtual Pet DFA: Kisah Hiu di Kampus 🎓

Aplikasi web interaktif (HTML, CSS, JavaScript) yang mensimulasikan **Virtual Pet** dengan perilaku yang dikendalikan sepenuhnya oleh **Deterministic Finite Automaton (DFA)**. Proyek ini dirancang untuk memvisualisasikan konsep Teori Bahasa dan Automata melalui interaksi yang menyenangkan dan realistis dalam konteks kehidupan mahasiswa. 🚀

---

## 🌟 Deskripsi Proyek
Pet ini adalah seekor **Hiu Mahasiswa** yang menjalani keseharian di kampus. Tidak seperti peliharaan virtual biasa yang menggunakan probabilitas, perilaku pet ini **100% deterministik**. Setiap aksi pengguna adalah simbol input yang akan memicu transisi state berdasarkan aturan logika yang pasti. 🧠

### ✨ Fitur Utama:
- **🎨 State-Based UI**: Seluruh tampilan halaman berubah secara dinamis mengikuti state DFA saat ini.
- **🦈 Karakter CSS**: Hiu digambar 100% menggunakan kode CSS, memungkinkan ekspresi yang responsif.
- **📚 Logika Realistis**: Alur transisi dirancang menyerupai dinamika kehidupan perkuliahan nyata.

---

## 📐 Definisi Formal DFA
Secara matematis, sistem pet ini didefinisikan sebagai 5-tuple $M = (Q, \Sigma, \delta, q_0, F)$:

### 1. 📂 Q (Himpunan State)
| Simbol | Nama State | Deskripsi Visual & Kondisi 🦈 |
| :--- | :--- | :--- |
| **NORMAL** | 😐 Normal | Kondisi stabil, mood netral dengan senyum tipis. |
| **HAPPY** | 😊 Happy | Mood sangat baik, produktivitas tinggi. |
| **HUNGRY** | 🤤 Hungry | Perut kosong, butuh asupan energi segera. |
| **TIRED** | 😴 Tired | Tenaga terkuras, badan terasa berat. |
| **BORED** | 😑 Bored | Jenuh dengan rutinitas kampus yang monoton. |
| **SICK** | 🤒 Sick | Kondisi drop/meriang akibat kelelahan/lapar. |
| **DEAD** | 😵 Dead | Burnout total (State akhir penyerap). |

### 2. ⌨️ Σ (Alfabet Input / Aksi)
- **🍱 FEED**: Memberi makan/camilan di kantin.
- **🎮 PLAY**: Beraktivitas sosial atau hiburan.
- **😴 SLEEP**: Istirahat/tidur untuk pemulihan.
- **📚 STUDY**: Melakukan kegiatan akademik/tugas.

### 3. 🏁 q₀ (Initial State)
- Kondisi awal dipilih secara acak dari $\{Q \setminus DEAD\}$ setiap kali simulasi dimulai.

### 4. 🏁 F (Final State)
- **{ DEAD }**: State penyerap (absorbing state) di mana tidak ada transisi keluar.

---

## 📊 Tabel Transisi State (δ)
Tabel di bawah ini menunjukkan bagaimana setiap aksi (Σ) mempengaruhi kondisi pet (Q) secara deterministik:

| State (Q) \ Aksi (Σ) | 🍱 FEED | 🎮 PLAY | 😴 SLEEP | 📚 STUDY |
| :--- | :---: | :---: | :---: | :---: |
| **😐 NORMAL** | HAPPY | HUNGRY | HAPPY | BORED |
| **😊 HAPPY** | HAPPY | HUNGRY | HAPPY | NORMAL |
| **🤤 HUNGRY** | NORMAL | TIRED | HUNGRY | SICK |
| **😴 TIRED** | NORMAL | SICK | NORMAL | SICK |
| **😑 BORED** | NORMAL | HAPPY | NORMAL | TIRED |
| **🤒 SICK** | TIRED | DEAD | NORMAL | DEAD |
| **😵 DEAD** | DEAD | DEAD | DEAD | DEAD |

---

## ⚖️ Analisis Logika Transisi
Sistem ini mengimplementasikan alur yang logis dan berurutan:
- **📖 Efek Belajar (STUDY)**: Dimulai dari `NORMAL` → `BORED` → `TIRED` → `SICK` → `DEAD` (Burnout).
- **🏃 Efek Bermain (PLAY)**: Bermain meningkatkan mood menjadi `HAPPY`, namun memicu rasa lapar (`HUNGRY`).
- **🛌 Pemulihan (SLEEP/FEED)**: Makan saat lapar atau tidur saat sakit/capek adalah kunci kembali ke `NORMAL`.

---

## 📂 Struktur Proyek
```
virtual-pet-dfa/
├── 📄 index.html   # Antarmuka utama & Struktur UI
├── 🎨 style.css    # Styling, Animasi, & Visualisasi Karakter
├── ⚙️ script.js    # Logika DFA & Manajemen State
├── 📖 README.md    # Dokumentasi Teknis (File ini)
└── 🖼️ *.png        # Aset Pendukung (Opsional)
```

---

## 🚀 Cara Menjalankan
1. Pastikan seluruh file berada dalam satu direktori yang sama. 📁
2. Buka file **`index.html`** menggunakan browser modern (Chrome, Firefox, atau Edge). 🌐
3. Isi nama pet dan mulailah berinteraksi melalui tombol aksi yang tersedia. 🖱️
4. Gunakan tombol **"Acak kondisi awal lagi"** untuk mereset simulasi. 🔄

---
*Dibuat dengan penuh ❤️ untuk memenuhi tugas mata kuliah Teori Bahasa dan Automata.*
