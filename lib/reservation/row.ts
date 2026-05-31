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
  user_id: string | null;
  kebutuhan: string | null;
  waktu_kunjungan: string | null;
  paket_agripreneurcamp: string | null;
  ruangan: string | null;
  paket_camping: string | null;
  tanggal_selesai_acara: string | null;
  kebutuhan_survey: string | null;
  alasan_penolakan: string | null;
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
  "user_id",
  "kebutuhan",
  "waktu_kunjungan",
  "paket_agripreneurcamp",
  "ruangan",
  "paket_camping",
  "tanggal_selesai_acara",
  "kebutuhan_survey",
  "alasan_penolakan",
].join(", ");
