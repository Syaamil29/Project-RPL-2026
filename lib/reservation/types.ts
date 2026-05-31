export enum ReservationKebutuhan {
  Agroedutourism = "Kunjungan Agroedutourism",
  Agripreneurcamp = "Pelatihan Agripreneurcamp",
  PeminjamanRuangan = "Peminjaman Ruangan",
  PaketCamping = "Paket Camping",
  SurveyWawancara = "Survey/Wawancara",
}

// Common fields present in all reservations
export interface BaseReservation {
  user_id: string;
  nama_lengkap: string;
  instansi: string;
  email: string;
  nomor_telepon: string;
  kebutuhan: ReservationKebutuhan;
  // optional nullable fields per kebutuhan will be added below
}

// 1. Kunjungan Agroedutourism
export interface AgroedutourismFields {
  waktu_kunjungan: "Sesi 1" | "Sesi 2" | "Sesi 3";
  surat_kunjungan_url?: string | null;
}

// 2. Pelatihan Agripreneurcamp
export interface AgripreneurcampFields {
  paket_agripreneurcamp: "Beginner" | "Middle" | "Custom";
  waktu_pelatihan: "Sesi 1" | "Sesi 2";
  surat_pelatihan_url?: string | null;
}

// 3. Peminjaman Ruangan
export interface RuanganFields {
  ruangan: "Balai Rakyat Indonesia" | "Ruang Meeting" | "Ruang VIP";
  waktu_peminjaman: "Half day" | "Full day";
  surat_peminjaman_url?: string | null;
}

// 4. Paket Camping
export interface CampingFields {
  paket_camping: "Basic" | "Premium" | "Custom";
  tanggal_selesai_acara: string; // ISO date string
  surat_permohonan_acara_url?: string | null;
}

// 5. Survey/Wawancara
export interface SurveyFields {
  kebutuhan_survey: string;
  waktu_survey: string; // time string (HH:mm)
  surat_kegiatan_url?: string | null;
}

export type ConditionalReservationFields =
  | AgroedutourismFields
  | AgripreneurcampFields
  | RuanganFields
  | CampingFields
  | SurveyFields;

export type ReservationPayload = BaseReservation & Partial<ConditionalReservationFields>;

// Flattened form values for React Hook Form
export interface ReservationFormValues {
  // common
  namaLengkap: string;
  instansi: string;
  email: string;
  nomorTelepon: string;
  kebutuhan: ReservationKebutuhan;
  tanggalKunjungan: string;
  jumlahPengunjung: number;
  // agroedutourism
  waktu_kunjungan?: "Sesi 1" | "Sesi 2" | "Sesi 3";
  surat_kunjungan?: FileList;
  // agripreneurcamp
  paket_agripreneurcamp?: "Beginner" | "Middle" | "Custom";
  waktu_pelatihan?: "Sesi 1" | "Sesi 2";
  surat_pelatihan?: FileList;
  // peminjaman ruangan
  ruangan?: "Balai Rakyat Indonesia" | "Ruang Meeting" | "Ruang VIP";
  waktu_peminjaman?: "Half day" | "Full day";
  surat_peminjaman?: FileList;
  // paket camping
  paket_camping?: "Basic" | "Premium" | "Custom";
  tanggal_selesai_acara?: string;
  surat_permohonan_acara?: FileList;
  // survey
  kebutuhan_survey?: string;
  waktu_survey?: string;
  surat_kegiatan?: FileList;
}
