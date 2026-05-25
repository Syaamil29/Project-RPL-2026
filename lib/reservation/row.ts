export type ReservationStatus = "pending" | "approved" | "rejected";

/** Row from Supabase `reservasi` table. */
export type ReservationRow = {
  id: string;
  nama_lengkap: string;
  instansi: string | null;
  email: string;
  nomor_telepon: string;
  tanggal_kunjungan: string | null;
  jumlah_orang: number | null;
  tujuan_kunjungan: string | null;
  fasilitas: string[] | null;
  dokumen_url: string | null;
  status: ReservationStatus | null;
  created_at: string;
  sesi_kunjungan: string | null;
  user_id: string | null;
  kebutuhan: string | null;
  waktu_kunjungan: string | null;
  surat_kunjungan_url: string | null;
  paket_agripreneurcamp: string | null;
  waktu_pelatihan: string | null;
  surat_pelatihan_url: string | null;
  ruangan: string | null;
  waktu_peminjaman: string | null;
  surat_peminjaman_url: string | null;
  paket_camping: string | null;
  tanggal_selesai_acara: string | null;
  surat_permohonan_acara_url: string | null;
  kebutuhan_survey: string | null;
  waktu_survey: string | null;
  surat_kegiatan_url: string | null;
};

export type ReservasiRowInsert = Omit<
  ReservationRow,
  "id" | "created_at"
> & {
  status: "pending";
};

export const RESERVASI_SELECT_COLUMNS = [
  "id",
  "nama_lengkap",
  "instansi",
  "email",
  "nomor_telepon",
  "tanggal_kunjungan",
  "jumlah_orang",
  "tujuan_kunjungan",
  "fasilitas",
  "dokumen_url",
  "status",
  "created_at",
  "sesi_kunjungan",
  "user_id",
  "kebutuhan",
  "waktu_kunjungan",
  "surat_kunjungan_url",
  "paket_agripreneurcamp",
  "waktu_pelatihan",
  "surat_pelatihan_url",
  "ruangan",
  "waktu_peminjaman",
  "surat_peminjaman_url",
  "paket_camping",
  "tanggal_selesai_acara",
  "surat_permohonan_acara_url",
  "kebutuhan_survey",
  "waktu_survey",
  "surat_kegiatan_url",
].join(", ");
