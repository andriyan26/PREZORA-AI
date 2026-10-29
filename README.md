# PREZORA AI — Intelligent AI Assistant & Presentation Coach 🎙️✨

> **Tagline:** *Your Ideas. Your Voice. Your Confidence.*  
> **Deskripsi:** Asisten AI cerdas untuk diskusi multi-topik sekaligus pelatih presentasi interaktif dengan simulasi audiens cerdas dan mesin evaluasi terstruktur.

---

## 🌟 Fitur Utama

1. **General AI Assistant**
   - Diskusi interaktif berbagai topik (teknologi, bisnis, akademis, penulisan, interview kerja).
   - Dukungan Markdown lengkap, syntax highlighting kode, tombol salin, regenerasi respons, dan penghapusan riwayat percakapan.
   - Pilihan referensi dokumen PDF/PPTX untuk diskusi berbasis materi (RAG).

2. **Voice Conversation & Speech Engine**
   - **Speech-to-Text (STT)**: Pengenalan suara secara langsung dengan visualisasi gelombang suara (*waveform animation*).
   - **Text-to-Speech (TTS)**: Pembacaan jawaban AI dengan kontrol suara (*play, pause, cancel, mute*) dan pengaturan kecepatan (*speed rate*).

3. **Presentation Coach & Practice Room**
   - Pilihan kategori presentasi: Presentasi Kuliah, Seminar/Sidang Skripsi, Presentasi Proyek, Rapat Kerja, Business Pitching, Public Speaking, atau Presentasi Bebas.
   - **Simulasi Persona Audiens AI**:
     - *Mentor Ramah*: Memberikan masukan supportif & konstruktif.
     - *Dosen Penguji*: Akademis, kritis terhadap metodologi dan kebaruan (*novelty*).
     - *Manajer Profesional*: Berorientasi pada KPI, efisiensi eksekusi, dan mitigasi risiko.
     - *Investor Venture*: Fokus pada unit ekonomi, skalabilitas pasar, dan ROI.
     - *Calon Klien*: Fokus pada kemudahan adopsi solusi dan biaya.
     - *Audiens Umum*: Mengutamakan bahasa komunikatif tanpa jargon teknis rumit.
   - **Interactive Practice Room**: Timer target & waktu berjalan riil, pencatatan transkrip ucapan langsung, pertanyaan interupsi dari audiens simulasi, dan mode tanya-jawab.

4. **Mesin Evaluasi AI Terstruktur (0–100)**
   - Skor keseluruhan (*Overall Score*) dengan indikator visual.
   - Penilaian komprehensif 7 dimensi:
     1. Struktur Presentasi
     2. Kejelasan Penjelasan
     3. Relevansi & Kelengkapan Isi
     4. Alur Logika & Transisi
     5. Pemilihan Kata (Diksi) & Filler Words
     6. Penguasaan Tanya Jawab
     7. Manajemen Waktu & Tempo Bicara (Words Per Minute)
   - Bukti transkrip dan saran konkret per dimensi.
   - Perbandingan kalimat sebelum & sesudah (*Before vs After*) untuk menyempurnakan gaya penyampaian.
   - Rekomendasi latihan berikutnya (*Next Practice Action Items*).

5. **Audience Q&A Simulator**
   - Latihan respons spontan menghadapi pertanyaan kritis dari persona audiens.
   - Evaluasi langsung dengan poin kekuatan, celah jawaban, dan contoh jawaban model ideal.

6. **Script & Slide Assistant**
   - Pembuat outline presentasi slide-by-slide lengkap dengan catatan pembicara (*speaker notes*) dan estimasi durasi.
   - Penyempurna naskah pidato (*speech refiner*) dengan penyesuaian gaya bahasa (*formal, persuasif, inspiratif*).

7. **My Documents (PDF & PPTX Knowledge Vault)**
   - Unggah file PDF dan PPTX (hingga 15 MB) dengan ekstraksi teks otomatis dan pemotongan teks (*chunking*).
   - Fitur ringkasan eksekutif dan diskusi terarah berdasarkan isi dokumen.

8. **Progress & Analytics**
   - Grafik tren perkembangan skor latihan dari waktu ke waktu.
   - Rata-rata skor per dimensi penilaian.
   - Rekomendasi latihan personal berbasis database MySQL riil.

9. **Desain Modern & Responsif 100% (Desktop & Smartphone)**
   - Dark Mode & Light Mode dengan penyimpanan preferensi pada akun pengguna.
   - Tampilan khusus smartphone dengan **Bottom Navigation Bar** (*Home, Chat, Coach, Docs, Riwayat*) dan laci navigasi (*drawer*).

---

## 🛠️ Arsitektur Teknologi

### Frontend (`client/`)
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** dengan palet Indigo/Violet & Dark Navy (`#0B1020`, `#111827`)
- **Lucide React** untuk ikon modern
- **React Router v6** untuk routing dan proteksi halaman
- **TanStack React Query v5** untuk manajemen server state
- **Zustand** untuk state global (Auth, Theme)
- **Web Speech API** (SpeechRecognition & SpeechSynthesis)
- **Canvas Confetti** untuk perayaan penyelesaian sesi

### Backend (`server/`)
- **Node.js** + **Express.js** + **TypeScript**
- **Prisma ORM** + **MySQL 8.0**
- **JWT (JSON Web Token)**: Access token & refresh token tersimpan aman
- **Bcrypt.js**: Hashing password yang aman
- **Multer** & **pdf-parse**: Ekstraksi dokumen PDF & PPTX yang aman
- **Zod**: Validasi payload request yang ketat
- **AI Service Layer**: Mendukung provider Google Gemini, OpenAI, Groq, OpenRouter, dan sistem penalaran offline/fallback cerdas.

---

## 📦 Struktur Proyek

```
PREZORA AI/
├── client/                     # Frontend React + TypeScript + Vite
│   ├── src/
│   │   ├── components/         # Layout (Navbar, Sidebar, MobileNav, AppLayout)
│   │   ├── hooks/              # useSpeechRecognition, useSpeechSynthesis
│   │   ├── pages/              # Landing, Login, Register, Dashboard, Chat, Coach, Evaluasi, dsb.
│   │   ├── services/           # Axios API client dengan interceptor JWT
│   │   ├── stores/             # Zustand authStore & themeStore
│   │   └── types/              # TypeScript Interfaces
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── server/                     # Backend Node.js + Express + Prisma
│   ├── prisma/
│   │   ├── schema.prisma       # 12 Tabel database MySQL
│   │   └── seed.ts             # Data inisial akun demo & sesi contoh
│   ├── src/
│   │   ├── config/             # Environment, Prisma instance
│   │   ├── controllers/        # Auth, User, Conversation, Practice, Document, Analytics, Script
│   │   ├── middleware/         # Auth JWT, ErrorHandler, Upload
│   │   ├── routes/             # REST API routes /api/v1
│   │   ├── services/           # AIService (Gemini, OpenAI, Fallback) & DocumentService
│   │   ├── utils/              # JWT, Hashing, Response helpers
│   │   ├── app.ts
│   │   └── server.ts
│   ├── tests/                  # Automated tests
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml          # Konfigurasi container MySQL opsional
└── README.md
```

---

## 🚀 Panduan Menjalankan Aplikasi

### 1. Prasyarat
- **Node.js** v18+ atau v20+
- **MySQL Server** aktif (misalnya melalui Laragon, XAMPP, atau Docker)

### 2. Konfigurasi Database MySQL
Pastikan database `prezora_ai` telah dibuat di MySQL:
```sql
CREATE DATABASE IF NOT EXISTS prezora_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Konfigurasi Environment (`server/.env`)
File `server/.env` telah terkonfigurasi:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="mysql://root:@localhost:3306/prezora_ai"
JWT_ACCESS_SECRET="prezora_super_secret_access_jwt_key_2026_xyz"
JWT_REFRESH_SECRET="prezora_super_secret_refresh_jwt_key_2026_xyz"
CLIENT_URL="http://localhost:5173"
APP_URL="http://localhost:5000"

# AI Provider Configuration (gemini, openai, groq, openrouter)
AI_PROVIDER=gemini
AI_API_KEY=
AI_MODEL=gemini-1.5-flash
AI_BASE_URL=

STORAGE_DRIVER=local
UPLOAD_DIR="./uploads"
```

> **Catatan AI API Key:** Jika `AI_API_KEY` belum diisi, PREZORA AI secara otomatis menggunakan mesin penalaran lokal (*smart offline reasoning & evaluation engine*) sehingga seluruh fitur obrolan, tanya jawab audiens, dan kalkulasi evaluasi 0–100 tetap berjalan nyata tanpa error. Jika Anda memiliki API key Gemini atau OpenAI, cukup masukkan ke `AI_API_KEY`.

### 4. Menjalankan Database Migration & Seed
Masuk ke direktori `server` dan jalankan:
```bash
cd server
npx prisma db push
npm run prisma:seed
```

### 5. Menjalankan Backend Server
Di dalam folder `server`:
```bash
npm run dev
# Server berjalan di http://localhost:5000
```

### 6. Menjalankan Frontend Client
Di terminal terpisah, masuk ke direktori `client`:
```bash
cd client
npm run dev
# Frontend berjalan di http://localhost:5173
```

---

## 🔑 Akun Demo Siap Pakai

Untuk mempermudah pengujian, sistem telah menyediakan akun demo default:
- **Email:** `demo@prezora.ai`
- **Password:** `password123`
- *Tersedia tombol pintas **"1-Klik Masuk"** di halaman login untuk masuk secara instan.*

---

## 🧪 Menjalankan Automated Test

Jalankan pengujian terotomatisasi untuk autentikasi, hashing, database persistence, evaluasi AI, dan kepemilikan data:
```bash
cd server
npm test
```

Hasil test:
```
🧪 Running automated tests for PREZORA AI...
✅ 1. Password hashing & verification: PASSED
✅ 2. JWT token encoding & decoding: PASSED
✅ 3. MySQL Database query (User & Preferences): PASSED (Andrian Syahputra)
✅ 4. Conversations & Messages verified: PASSED (1 conversation(s) found)
✅ 5. Practice Session & Evaluation retrieval: PASSED (Score: 84/100)
✅ 6. AI Presentation Evaluation Engine: PASSED (Score: 82/100, Criteria count: 7)

🎉 ALL 6 AUTOMATED BACKEND TESTS PASSED SUCCESSFULLY!
```

---

## 📱 Akses Smartphone & Responsivitas

Aplikasi PREZORA AI dirancang khusus agar nyaman digunakan di perangkat bergerak:
- Buka alamat IP lokal komputer Anda di browser ponsel (misalnya: `http://192.168.1.x:5173`).
- **Bottom Navigation Bar** memudahkan navigasi satu tangan (*thumb-friendly*).
- Fitur mikrofon suara langsung terintegrasi dengan browser mobile (Google Chrome / Safari).

---

## 📄 Lisensi
Hak Cipta © 2026 PREZORA AI Team. Seluruh hak cipta dilindungi undang-undang.
