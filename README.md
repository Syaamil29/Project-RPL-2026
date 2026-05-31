# Sistem Informasi Reservasi & Layanan ATP IPB

Sistem Informasi ini dirancang khusus untuk mengelola proses pendaftaran, jadwal ketersediaan, serta administrasi layanan di **Agribusiness and Technology Park (ATP) IPB University**. Aplikasi ini mempermudah pengguna untuk melakukan reservasi berbagai kebutuhan layanan dan membantu administrator dalam menyetujui, menolak, serta memantau jadwal secara real-time.

---

## Fitur Utama

### Fitur Pengguna (User)
- **Reservasi Dinamis:** Formulir reservasi satu pintu yang menyesuaikan input secara kondisional berdasarkan jenis kebutuhan (Agroedutourism, Agripreneurcamp, Ruangan, Camping, dan Survey/Wawancara).
- **Validasi Cerdas:** Validasi pengisian tanggal minimum H+1 (mulai besok) serta batas tanggal selesai acara.
- **Kalender Ketersediaan (Jadwal):** Visualisasi kalender bulanan interaktif yang menampilkan slot waktu/hari yang kosong (hijau), tentative/pending (kuning), atau penuh/booked (merah).
- **Riwayat Reservasi:** Memantau riwayat pengajuan reservasi beserta detail dokumen dan status persetujuan dari Admin.

### Fitur Administrator (Admin)
- **Admin Dashboard:** Panel kendali utama untuk mengelola seluruh sistem ATP IPB.
- **Kelola Reservasi:** List reservasi masuk dengan fitur persetujuan (*Approved*) dan penolakan (*Rejected*) cepat.
- **Visualisasi Jadwal Admin:** Kalender interaktif khusus admin untuk memantau status slot dan melakukan aksi update status langsung dari kalender.
- **Kelola Katalog & Kegiatan:** Mengelola data bento grid kegiatan ATP serta katalog produk yang dipasarkan.

---

## Tech Stack

- **Core Framework:** Next.js (App Router)
- **Bahasa Pemrograman:** TypeScript
- **Database & Auth:** Supabase (PostgreSQL & Supabase Auth)
- **Styling:** Tailwind CSS
- **State & Form Management:** React Hook Form
- **Type Checking:** TypeScript Compiler (`tsc`)

---


## Struktur Folder Penting

```text
├── app/                  # Next.js App Router Pages
│   ├── (admin)/admin/    # Rute & Dashboard Halaman Admin
│   └── (user)/reservasi/ # Rute & Form/Jadwal Halaman User
├── components/           # Reusable React Components
│   ├── reservation/      # Formulir & Section Reservasi Dinamis
│   └── AdminNavbar.tsx   # Header Navigasi Khusus Admin
├── lib/                  # Utilities, Konfigurasi & Library Core
│   ├── supabase.ts       # Supabase Client Wrapper
│   └── reservation/      # Core Library Sistem Reservasi
│       ├── types.ts      # Definisi Interface & Tipe TypeScript
│       ├── row.ts        # Model Database Row & Select Columns
│       ├── display.ts    # Helper Formatting Display Data di UI
│       └── build-insert.ts # Mapper Payload Form ke Row Database
```

---

## Cara Menjalankan Secara Lokal

### 1. Kloning Repositori
```bash
git clone <repository-url>
cd Project-RPL-2026
```

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variables (`.env.local`)
Buat berkas `.env.local` di root folder proyek dan masukkan kredensial Supabase Anda:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Jalankan Development Server
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) pada browser Anda untuk melihat hasilnya.

### 5. Verifikasi Tipe Data & Build
Untuk memastikan tidak ada error TypeScript sebelum melakukan deployment:
```bash
npx tsc --noEmit
npm run build
```
