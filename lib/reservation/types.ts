export enum ReservationKebutuhan {
  Agroedutourism = "Kunjungan Agroedutourism",
  Agripreneurcamp = "Pelatihan Agripreneurcamp",
  PeminjamanRuangan = "Peminjaman Ruangan",
  PaketCamping = "Paket Camping",
  SurveyWawancara = "Survey/Wawancara",
}

/** Field utama yang ada pada semua jenis reservasi. */
export interface BaseReservation {
  user_id: string;
  nama_lengkap: string;
  instansi: string;
  email: string;
  nomor_telepon: string;
  kebutuhan: ReservationKebutuhan;
}

/** Field untuk reservasi Agroedutourism. */
export interface AgroedutourismFields {
  waktu_kunjungan: "Sesi 1" | "Sesi 2" | "Sesi 3";
  dokumen_url?: string | null;
}

/** Field untuk reservasi Pelatihan Agripreneurcamp. */
export interface AgripreneurcampFields {
  paket_agripreneurcamp: "Beginner" | "Middle" | "Custom";
  waktu_kunjungan: "Sesi 1" | "Sesi 2";
  dokumen_url?: string | null;
}

/** Field untuk reservasi Peminjaman Ruangan. */
export interface RuanganFields {
  ruangan: "Balai Rakyat Indonesia" | "Ruang Meeting" | "Ruang VIP";
  waktu_kunjungan: "Half day" | "Full day";
  dokumen_url?: string | null;
}

/** Field untuk reservasi Paket Camping. */
export interface CampingFields {
  paket_camping: "Basic" | "Premium" | "Custom";
  tanggal_selesai_acara: string;
  dokumen_url?: string | null;
}

/** Field untuk reservasi Survey/Wawancara. */
export interface SurveyFields {
  kebutuhan_survey: string;
  waktu_kunjungan: string;
  dokumen_url?: string | null;
}

export type ConditionalReservationFields =
  | AgroedutourismFields
  | AgripreneurcampFields
  | RuanganFields
  | CampingFields
  | SurveyFields;

export type ReservationPayload = BaseReservation & Partial<ConditionalReservationFields>;

/** Struktur data form React Hook Form. */
export interface ReservationFormValues {
  namaLengkap: string;
  instansi: string;
  email: string;
  nomorTelepon: string;
  kebutuhan: ReservationKebutuhan;
  tanggalKunjungan: string;
  jumlahPengunjung: number;
  waktu_kunjungan?: "Sesi 1" | "Sesi 2" | "Sesi 3";
  surat_kunjungan?: FileList;
  paket_agripreneurcamp?: "Beginner" | "Middle" | "Custom";
  waktu_pelatihan?: "Sesi 1" | "Sesi 2";
  surat_pelatihan?: FileList;
  ruangan?: "Balai Rakyat Indonesia" | "Ruang Meeting" | "Ruang VIP";
  waktu_peminjaman?: "Half day" | "Full day";
  surat_peminjaman?: FileList;
  paket_camping?: "Basic" | "Premium" | "Custom";
  tanggal_selesai_acara?: string;
  surat_permohonan_acara?: FileList;
  kebutuhan_survey?: string;
  waktu_survey?: string;
  surat_kegiatan?: FileList;
}
